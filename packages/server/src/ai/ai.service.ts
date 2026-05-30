import { Inject, Injectable } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import { eq, and, sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";

@Injectable()
export class AiService {
  constructor(@Inject("DB") private db: BetterSQLite3Database<typeof schema>) {}

  async suggestNotes(itemName: string, category?: string) {
    // Check cache first
    const cached = this.db.select().from(schema.aiCache).where(
      and(eq(schema.aiCache.itemName, itemName), category ? eq(schema.aiCache.category, category) : sql`1=1`)
    ).get();
    if (cached) return JSON.parse(cached.result);

    // Check if LLM is configured
    const provider = process.env.LLM_PROVIDER;
    if (!provider || provider === "none") {
      return {
        notes: "",
        storageRequirements: null,
        shelfLife: null,
        source: "manual",
      };
    }

    try {
      let result;
      if (provider === "openai" || provider === "deepseek") {
        result = await this.callOpenAICompatible(itemName, category);
      } else if (provider === "ollama") {
        result = await this.callOllama(itemName, category);
      } else {
        return { notes: "", storageRequirements: null, shelfLife: null, source: "manual" };
      }

      // Cache the result
      this.db.insert(schema.aiCache).values({
        id: uuid(),
        itemName,
        category: category ?? null,
        result: JSON.stringify(result),
        createdAt: new Date().toISOString(),
      }).run();

      return { ...result, source: "ai" };
    } catch {
      return { notes: "", storageRequirements: null, shelfLife: null, source: "manual" };
    }
  }

  async suggestDisposal(itemName: string, category?: string, condition?: string) {
    const provider = process.env.LLM_PROVIDER;
    const defaultSuggestions = this.getDefaultDisposalSuggestions(category);

    if (!provider || provider === "none") return defaultSuggestions;

    try {
      if (provider === "openai" || provider === "deepseek") {
        return await this.callOpenAICompatibleForDisposal(itemName, category, condition);
      }
      return defaultSuggestions;
    } catch {
      return defaultSuggestions;
    }
  }

  async identifyFromPhoto(imageBase64: string) {
    const provider = process.env.LLM_PROVIDER;
    if (!provider || provider === "none") {
      return { name: "", notes: "", storageRequirements: null, source: "manual" };
    }
    try {
      if (provider === "openai" || provider === "deepseek") {
        return await this.callVisionAI(imageBase64);
      }
      return { name: "", notes: "", storageRequirements: null, source: "manual" };
    } catch {
      return { name: "", notes: "", storageRequirements: null, source: "manual" };
    }
  }

  private async callVisionAI(imageBase64: string) {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({
      baseURL: process.env.LLM_BASE_URL || "https://api.deepseek.com",
      apiKey: process.env.LLM_API_KEY || "",
    });

    const response = await client.chat.completions.create({
      model: process.env.LLM_MODEL || "deepseek-chat",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "识别图中物品，返回JSON：{name: string(物品中文名), notes: string(注意事项,控制在200字内), storageRequirements: {temperature?: string, humidity?: string}}" },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ],
        } as any,
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  private getDefaultDisposalSuggestions(category?: string) {
    if (category === "electronics") return [{ platform: "爱回收 / 转转", reason: "电子产品回收平台，支持估价上门" }];
    if (category === "books") return [{ platform: "多抓鱼 / 闲鱼", reason: "二手书交易平台" }];
    if (category === "clothing") return [{ platform: "得物 / 闲鱼", reason: "品牌服饰二手交易" }];
    return [{ platform: "闲鱼", reason: "综合二手交易平台" }];
  }

  private async callOpenAICompatible(itemName: string, category?: string) {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({
      baseURL: process.env.LLM_BASE_URL || "https://api.deepseek.com",
      apiKey: process.env.LLM_API_KEY || "",
    });

    const response = await client.chat.completions.create({
      model: process.env.LLM_MODEL || "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "你是一个家庭物品管理助手。根据物品名称返回JSON：{notes: string（中文注意事项）, storageRequirements: {temperature?: string, humidity?: string, other?: string[]}, shelfLife: string | null}",
        },
        { role: "user", content: `物品：${itemName}${category ? `，分类：${category}` : ""}` },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  private async callOpenAICompatibleForDisposal(itemName: string, category?: string, condition?: string) {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({
      baseURL: process.env.LLM_BASE_URL || "https://api.deepseek.com",
      apiKey: process.env.LLM_API_KEY || "",
    });

    const response = await client.chat.completions.create({
      model: process.env.LLM_MODEL || "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "你是一个家庭物品处置建议助手。根据物品信息返回JSON：{suggestions: {platform: string, reason: string}[]}",
        },
        { role: "user", content: `物品：${itemName}${category ? `，分类：${category}` : ""}${condition ? `，状态：${condition}` : ""}` },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  private async callOllama(itemName: string, category?: string) {
    const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const model = process.env.OLLAMA_MODEL || "qwen2.5";

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: `物品：${itemName}${category ? `，分类：${category}` : ""}。请返回JSON格式的注意事项、存放要求和保质期。`,
        stream: false,
        format: "json",
      }),
    });

    const data = await response.json() as { response?: string };
    return JSON.parse(data.response || "{}");
  }
}
