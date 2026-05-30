export type TransactionType = "inbound" | "outbound" | "transfer" | "adjustment";

export interface TransactionDto {
  id: string;
  itemId: string;
  type: TransactionType;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  fromLocationId: string | null;
  toLocationId: string | null;
  destination: string | null;
  destinationType: string | null;
  operator: string;
  photoPaths: string[];
  notes: string | null;
  createdAt: string;
}

export interface CreateTransactionDto {
  itemId: string;
  type: TransactionType;
  quantityChange: number;
  fromLocationId?: string;
  toLocationId?: string;
  destination?: string;
  destinationType?: string;
  notes?: string;
}

export interface CheckinDto {
  containerId: string;
  items: {
    name: string;
    quantity: number;
    unit?: string;
    expiryDate?: string;
    notes?: string;
    photoData?: string;
  }[];
}

export interface CheckoutDto {
  itemId: string;
  quantity: number;
  destination: string;
  destinationType?: string;
  notes?: string;
  photoData?: string;
}
