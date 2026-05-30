import { api } from "./client";

export interface Transaction {
  id: string;
  itemId: string;
  type: "inbound" | "outbound" | "transfer" | "adjustment";
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  destination: string | null;
  destinationType: string | null;
  operator: string;
  notes: string | null;
  createdAt: string;
}

export interface CheckinItem {
  name: string;
  quantity: number;
  unit?: string;
  expiryDate?: string;
  notes?: string;
}

export const transactionsApi = {
  list: (params?: { itemId?: string; type?: string; page?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.itemId) query.set("itemId", params.itemId);
    if (params?.type) query.set("type", params.type);
    if (params?.page) query.set("page", String(params.page));
    if (params?.pageSize) query.set("pageSize", String(params.pageSize));
    const qs = query.toString();
    return api.get<{ data: Transaction[]; total: number }>(`/transactions${qs ? `?${qs}` : ""}`);
  },
  checkin: (containerId: string, items: CheckinItem[]) =>
    api.post<Transaction[]>("/checkin", { containerId, items }),
  checkout: (itemId: string, quantity: number, destination: string, destinationType?: string, notes?: string) =>
    api.post<Transaction>("/checkout", { itemId, quantity, destination, destinationType, notes }),
  transfer: (itemId: string, quantity: number, toContainerId: string, notes?: string) =>
    api.post<Transaction>("/transfer", { itemId, quantity, toContainerId, notes }),
};
