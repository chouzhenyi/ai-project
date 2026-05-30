export interface ItemDto {
  id: string;
  name: string;
  categoryId: string | null;
  brand: string | null;
  model: string | null;
  quantity: number;
  unit: string;
  photoPaths: string[];
  locationId: string | null;
  productionDate: string | null;
  expiryDate: string | null;
  storageRequirements: Record<string, string> | null;
  notes: string | null;
  qrCode: string | null;
  minStock: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemDto {
  name: string;
  categoryId?: string;
  brand?: string;
  model?: string;
  quantity?: number;
  unit?: string;
  locationId?: string;
  productionDate?: string;
  expiryDate?: string;
  storageRequirements?: Record<string, string>;
  notes?: string;
  minStock?: number;
}

export type UpdateItemDto = Partial<CreateItemDto>;
