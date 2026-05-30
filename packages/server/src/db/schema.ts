import { sqliteTable, text, integer, real, foreignKey } from "drizzle-orm/sqlite-core";

export const locations = sqliteTable("locations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  parentId: text("parent_id"),
  type: text("type", { enum: ["house", "room", "furniture", "container"] }).notNull(),
  qrCode: text("qr_code").unique(),
  photoPath: text("photo_path"),
  conditions: text("conditions"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => ({
  parentFk: foreignKey({ columns: [table.parentId], foreignColumns: [table.id] }),
}));

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  parentId: text("parent_id"),
  icon: text("icon"),
  createdAt: text("created_at").notNull(),
}, (table) => ({
  parentFk: foreignKey({ columns: [table.parentId], foreignColumns: [table.id] }),
}));

export const items = sqliteTable("items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: text("category_id"),
  brand: text("brand"),
  model: text("model"),
  quantity: real("quantity").notNull().default(1),
  unit: text("unit").notNull().default("个"),
  photoPaths: text("photo_paths"),
  locationId: text("location_id"),
  productionDate: text("production_date"),
  expiryDate: text("expiry_date"),
  storageRequirements: text("storage_requirements"),
  notes: text("notes"),
  qrCode: text("qr_code").unique(),
  minStock: real("min_stock"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => ({
  categoryRef: foreignKey({ columns: [table.categoryId], foreignColumns: [categories.id] }),
  locationRef: foreignKey({ columns: [table.locationId], foreignColumns: [locations.id] }),
}));

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull(),
  type: text("type", { enum: ["inbound", "outbound", "transfer", "adjustment"] }).notNull(),
  quantityChange: real("quantity_change").notNull(),
  quantityBefore: real("quantity_before").notNull(),
  quantityAfter: real("quantity_after").notNull(),
  fromLocationId: text("from_location_id"),
  toLocationId: text("to_location_id"),
  destination: text("destination"),
  destinationType: text("destination_type"),
  operator: text("operator").notNull().default("家人"),
  photoPaths: text("photo_paths"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
}, (table) => ({
  itemRef: foreignKey({ columns: [table.itemId], foreignColumns: [items.id] }),
  fromLocRef: foreignKey({ columns: [table.fromLocationId], foreignColumns: [locations.id] }),
  toLocRef: foreignKey({ columns: [table.toLocationId], foreignColumns: [locations.id] }),
}));

export const aiCache = sqliteTable("ai_cache", {
  id: text("id").primaryKey(),
  itemName: text("item_name").notNull(),
  category: text("category"),
  result: text("result").notNull(),
  createdAt: text("created_at").notNull(),
});

export const alerts = sqliteTable("alerts", {
  id: text("id").primaryKey(),
  itemId: text("item_id"),
  type: text("type", { enum: ["expiry", "condition_mismatch", "low_stock"] }).notNull(),
  message: text("message").notNull(),
  severity: text("severity", { enum: ["info", "warning", "critical"] }).notNull(),
  resolved: integer("resolved", { mode: "boolean" }).notNull().default(false),
  resolvedAt: text("resolved_at"),
  createdAt: text("created_at").notNull(),
}, (table) => ({
  itemRef: foreignKey({ columns: [table.itemId], foreignColumns: [items.id] }),
}));
