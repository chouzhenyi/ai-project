import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AiService } from "./ai.service";

@ApiTags("AI")
@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("suggest-notes")
  @ApiOperation({ summary: "AI 建议注意事项" })
  async suggestNotes(@Body() body: { itemName: string; category?: string }) {
    return { data: await this.aiService.suggestNotes(body.itemName, body.category) };
  }

  @Post("suggest-disposal")
  @ApiOperation({ summary: "AI 建议处置方式" })
  async suggestDisposal(@Body() body: { itemName: string; category?: string; condition?: string }) {
    return { data: await this.aiService.suggestDisposal(body.itemName, body.category, body.condition) };
  }

  @Post("identify")
  @ApiOperation({ summary: "AI 识别图片中的物品" })
  async identify(@Body() body: { imageBase64: string }) {
    return { data: await this.aiService.identifyFromPhoto(body.imageBase64) };
  }
}
