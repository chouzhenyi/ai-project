import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq, and, desc, sql } from "drizzle-orm";
import * as schema from "../db/schema";

@Injectable()
export class TransactionsService {
  constructor(@Inject("DB") private db: BetterSQLite3Database<typeof schema>) {}

  findAll(params: { itemId?: string; containerId?: string; type?: string; page?: number; pageSize?: number }) {
    const { itemId, containerId, type, page = 1, pageSize = 20 } = params;
    const conditions: ReturnType<typeof eq>[] = [];

    if (itemId) conditions.push(eq(schema.transactions.itemId, itemId));
    if (type) conditions.push(eq(schema.transactions.type, type as any));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const data = this.db
      .select()
      .from(schema.transactions)
      .where(where)
      .orderBy(desc(schema.transactions.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .all();

    const total = this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.transactions)
      .where(where)
      .get();

    // If containerId filter, need to filter by item's location
    // For now just return with item info
    return { data, total: total?.count ?? 0, page, pageSize };
  }

  findById(id: string) {
    const tx = this.db.select().from(schema.transactions).where(eq(schema.transactions.id, id)).get();
    if (!tx) throw new NotFoundException("操作记录不存在");
    return tx;
  }

  create(data: {
    itemId: string;
    type: "inbound" | "outbound" | "transfer" | "adjustment";
    quantityChange: number;
    fromLocationId?: string;
    toLocationId?: string;
    destination?: string;
    destinationType?: string;
    notes?: string;
  }) {
    const item = this.db.select().from(schema.items).where(eq(schema.items.id, data.itemId)).get();
    if (!item) throw new NotFoundException("物品不存在");

    if (data.type === "outbound" && !data.destination) {
      throw new BadRequestException("出库时去向为必填项");
    }

    const quantityBefore = item.quantity;
    const quantityAfter = quantityBefore + data.quantityChange;

    if (quantityAfter < 0) {
      throw new BadRequestException("数量不足，无法出库");
    }

    const now = new Date().toISOString();
    const id = uuid();
    this.db.insert(schema.transactions).values({
      id,
      itemId: data.itemId,
      type: data.type,
      quantityChange: data.quantityChange,
      quantityBefore,
      quantityAfter,
      fromLocationId: data.fromLocationId ?? null,
      toLocationId: data.toLocationId ?? null,
      destination: data.destination ?? null,
      destinationType: data.destinationType ?? null,
      operator: "家人",
      photoPaths: null,
      notes: data.notes ?? null,
      createdAt: now,
    }).run();

    this.db.update(schema.items).set({
      quantity: quantityAfter,
      updatedAt: now,
      locationId: data.toLocationId ?? item.locationId,
    }).where(eq(schema.items.id, data.itemId)).run();

    return this.findById(id);
  }

  private checkStorageCondition(itemName: string, containerId: string) {
    const container = this.db.select().from(schema.locations).where(eq(schema.locations.id, containerId)).get();
    if (!container?.conditions) return;

    // Find items with matching name that have storage requirements
    const items = this.db.select().from(schema.items).where(
      and(eq(schema.items.name, itemName), eq(schema.items.locationId, containerId))
    ).all();

    for (const item of items) {
      if (!item.storageRequirements) continue;

      const reqs = JSON.parse(item.storageRequirements);
      const containerConditions = JSON.parse(container.conditions!);

      const conflicts: string[] = [];
      if (reqs.temperature && containerConditions.temperature && reqs.temperature !== containerConditions.temperature) {
        conflicts.push(`需要${reqs.temperature}，但容器为${containerConditions.temperature}`);
      }
      if (reqs.humidity && containerConditions.humidity && reqs.humidity !== containerConditions.humidity) {
        conflicts.push(`需要${reqs.humidity}，但容器为${containerConditions.humidity}`);
      }

      if (conflicts.length > 0) {
        const existing = this.db.select().from(schema.alerts).where(
          and(eq(schema.alerts.itemId, item.id), eq(schema.alerts.type, "condition_mismatch"), eq(schema.alerts.resolved, false))
        ).get();

        if (!existing) {
          this.db.insert(schema.alerts).values({
            id: uuid(),
            itemId: item.id,
            type: "condition_mismatch",
            message: `${item.name}: ${conflicts.join("；")}`,
            severity: "warning",
            resolved: false,
            createdAt: new Date().toISOString(),
          }).run();
        }
      }
    }
  }

  checkin(data: { containerId: string; items: { name: string; quantity: number; unit?: string; expiryDate?: string; notes?: string }[] }) {
    const container = this.db.select().from(schema.locations).where(eq(schema.locations.id, data.containerId)).get();
    if (!container) throw new NotFoundException("容器不存在");

    const results = [];
    for (const itemData of data.items) {
      this.checkStorageCondition(itemData.name, data.containerId);
      const item = this.db.select().from(schema.items).where(
        and(eq(schema.items.name, itemData.name), eq(schema.items.locationId, data.containerId))
      ).get();

      if (item) {
        // 同容器内已有同名物品 → 增加数量
        const tx = this.create({
          itemId: item.id,
          type: "inbound",
          quantityChange: itemData.quantity,
          toLocationId: data.containerId,
          notes: itemData.notes,
        });
        results.push(tx);
      } else {
        // 新物品
        const now = new Date().toISOString();
        const id = uuid();
        this.db.insert(schema.items).values({
          id,
          name: itemData.name,
          quantity: itemData.quantity,
          unit: itemData.unit ?? "个",
          locationId: data.containerId,
          expiryDate: itemData.expiryDate ?? null,
          notes: itemData.notes ?? null,
          photoPaths: null,
          createdAt: now,
          updatedAt: now,
        }).run();

        this.create({
          itemId: id,
          type: "inbound",
          quantityChange: itemData.quantity,
          toLocationId: data.containerId,
        });
        results.push(this.findById(id));
      }
    }
    return results;
  }

  checkout(data: { itemId: string; quantity: number; destination: string; destinationType?: string; notes?: string }) {
    return this.create({
      itemId: data.itemId,
      type: "outbound",
      quantityChange: -data.quantity,
      destination: data.destination,
      destinationType: data.destinationType,
      notes: data.notes,
    });
  }

  transfer(data: { itemId: string; quantity: number; toContainerId: string; notes?: string }) {
    const item = this.db.select().from(schema.items).where(eq(schema.items.id, data.itemId)).get();
    if (!item) throw new NotFoundException("物品不存在");

    return this.create({
      itemId: data.itemId,
      type: "transfer",
      quantityChange: 0,
      fromLocationId: item.locationId ?? undefined,
      toLocationId: data.toContainerId,
      destination: "挪到其他容器",
      destinationType: "transfer",
      notes: data.notes,
    });
  }
}
