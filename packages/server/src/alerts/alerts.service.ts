import { Inject, Injectable } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq, and, sql } from "drizzle-orm";
import * as schema from "../db/schema";

@Injectable()
export class AlertsService {
  constructor(@Inject("DB") private db: BetterSQLite3Database<typeof schema>) {}

  findAll(resolved?: boolean) {
    const conditions = resolved !== undefined ? eq(schema.alerts.resolved, resolved) : undefined;
    return this.db.select().from(schema.alerts).where(conditions).orderBy(sql`${schema.alerts.createdAt} DESC`).all();
  }

  getSummary() {
    const all = this.db.select().from(schema.alerts).all();
    return {
      total: all.length,
      unresolved: all.filter((a) => !a.resolved).length,
      bySeverity: {
        critical: all.filter((a) => a.severity === "critical" && !a.resolved).length,
        warning: all.filter((a) => a.severity === "warning" && !a.resolved).length,
        info: all.filter((a) => a.severity === "info" && !a.resolved).length,
      },
    };
  }

  resolve(id: string) {
    this.db.update(schema.alerts).set({
      resolved: true,
      resolvedAt: new Date().toISOString(),
    }).where(eq(schema.alerts.id, id)).run();
    return { resolved: true };
  }

  // 定时任务：检查保质期并生成预警
  checkExpiryAlerts() {
    const now = new Date();
    const items = this.db.select().from(schema.items).all();

    for (const item of items) {
      if (!item.expiryDate) continue;
      const expiry = new Date(item.expiryDate);
      const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let severity: "critical" | "warning" | "info";
      let message: string;

      if (daysUntilExpiry < 0) {
        severity = "critical";
        message = `${item.name} 已过期 ${Math.abs(daysUntilExpiry)} 天`;
      } else if (daysUntilExpiry <= 7) {
        severity = "warning";
        message = `${item.name} 将于 ${daysUntilExpiry} 天后到期`;
      } else if (daysUntilExpiry <= 30) {
        severity = "info";
        message = `${item.name} 将于 ${daysUntilExpiry} 天后到期`;
      } else {
        continue;
      }

      const existing = this.db.select().from(schema.alerts).where(
        and(eq(schema.alerts.itemId, item.id), eq(schema.alerts.type, "expiry"), eq(schema.alerts.resolved, false))
      ).get();

      if (!existing) {
        this.db.insert(schema.alerts).values({
          id: uuid(),
          itemId: item.id,
          type: "expiry",
          message,
          severity,
          resolved: false,
          createdAt: new Date().toISOString(),
        }).run();
      }
    }
  }
}
