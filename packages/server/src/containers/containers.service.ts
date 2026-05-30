import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq, and, isNull, like } from "drizzle-orm";
import * as schema from "../db/schema";

@Injectable()
export class ContainersService {
  constructor(@Inject("DB") private db: BetterSQLite3Database<typeof schema>) {}

  findAll(parentId?: string, keyword?: string) {
    if (keyword) {
      return this.db.select().from(schema.locations)
        .where(like(schema.locations.name, `%${keyword}%`))
        .all();
    }
    const conditions = parentId
      ? eq(schema.locations.parentId, parentId)
      : isNull(schema.locations.parentId);
    return this.db.select().from(schema.locations).where(conditions).all();
  }

  getTree() {
    const all = this.db.select().from(schema.locations).all();
    const buildTree = (parentId: string | null): Record<string, unknown>[] =>
      all
        .filter((n) => n.parentId === parentId)
        .map((n) => ({
          ...n,
          children: buildTree(n.id),
        }));
    return buildTree(null);
  }

  findById(id: string) {
    const container = this.db.select().from(schema.locations).where(eq(schema.locations.id, id)).get();
    if (!container) throw new NotFoundException("容器不存在");

    const items = this.db.select().from(schema.items).where(eq(schema.items.locationId, id)).all();
    return { ...container, items };
  }

  findByQrCode(qrCode: string) {
    const container = this.db.select().from(schema.locations).where(eq(schema.locations.qrCode, qrCode)).get();
    if (!container) throw new NotFoundException("容器不存在");
    return this.findById(container.id);
  }

  create(data: { name: string; parentId?: string; type: string; conditions?: string }) {
    const now = new Date().toISOString();
    const id = uuid();
    const qrCode = `C:${id.split("-").slice(0, 2).join("-")}`;
    this.db.insert(schema.locations).values({
      id,
      name: data.name,
      parentId: data.parentId ?? null,
      type: data.type as any,
      qrCode,
      conditions: data.conditions ?? null,
      photoPath: null,
      createdAt: now,
      updatedAt: now,
    }).run();
    return this.findById(id);
  }

  update(id: string, data: Record<string, unknown>) {
    this.findById(id);
    const now = new Date().toISOString();
    this.db.update(schema.locations).set({ ...data, updatedAt: now }).where(eq(schema.locations.id, id)).run();
    return this.findById(id);
  }

  delete(id: string) {
    this.findById(id);
    const childCount = this.db.select().from(schema.locations).where(eq(schema.locations.parentId, id)).all().length;
    if (childCount > 0) throw new Error("容器下有子节点，无法删除");
    const itemCount = this.db.select().from(schema.items).where(eq(schema.items.locationId, id)).all().length;
    if (itemCount > 0) throw new Error("容器内有物品，无法删除");
    this.db.delete(schema.locations).where(eq(schema.locations.id, id)).run();
    return { deleted: true };
  }
}
