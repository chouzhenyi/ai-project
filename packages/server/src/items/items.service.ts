import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq, like, and, or, sql } from "drizzle-orm";
import * as schema from "../db/schema";

@Injectable()
export class ItemsService {
  constructor(@Inject("DB") private db: BetterSQLite3Database<typeof schema>) {}

  findAll(params: {
    keyword?: string;
    categoryId?: string;
    locationId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { keyword, categoryId, locationId, page = 1, pageSize = 20 } = params;
    const conditions: ReturnType<typeof eq>[] = [];

    if (keyword) {
      conditions.push(like(schema.items.name, `%${keyword}%`));
    }
    if (categoryId) {
      conditions.push(eq(schema.items.categoryId, categoryId));
    }
    if (locationId) {
      conditions.push(eq(schema.items.locationId, locationId));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const data = this.db
      .select()
      .from(schema.items)
      .where(where)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .all();

    const total = this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.items)
      .where(where)
      .get();

    return { data, total: total?.count ?? 0, page, pageSize };
  }

  findById(id: string) {
    const item = this.db.select().from(schema.items).where(eq(schema.items.id, id)).get();
    if (!item) throw new NotFoundException("物品不存在");
    return item;
  }

  create(data: {
    name: string;
    categoryId?: string;
    brand?: string;
    model?: string;
    quantity?: number;
    unit?: string;
    locationId?: string;
    productionDate?: string;
    expiryDate?: string;
    storageRequirements?: string;
    notes?: string;
    minStock?: number;
  }) {
    const now = new Date().toISOString();
    const id = uuid();
    this.db.insert(schema.items).values({
      id,
      ...data,
      quantity: data.quantity ?? 1,
      unit: data.unit ?? "个",
      createdAt: now,
      updatedAt: now,
    }).run();
    return this.findById(id);
  }

  update(id: string, data: Record<string, unknown>) {
    this.findById(id);
    const now = new Date().toISOString();
    this.db.update(schema.items).set({ ...data, updatedAt: now }).where(eq(schema.items.id, id)).run();
    return this.findById(id);
  }

  delete(id: string) {
    this.findById(id);
    this.db.delete(schema.items).where(eq(schema.items.id, id)).run();
    return { deleted: true };
  }
}
