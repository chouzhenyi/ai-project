import { api } from "./client";

export interface Item {
  id: string;
  name: string;
  categoryId: string | null;
  brand: string | null;
  model: string | null;
  quantity: number;
  unit: string;
  photoPaths: string | null;
  locationId: string | null;
  productionDate: string | null;
  expiryDate: string | null;
  storageRequirements: string | null;
  notes: string | null;
  qrCode: string | null;
  minStock: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItemsListResponse {
  data: Item[];
  total: number;
  page: number;
  pageSize: number;
}

export const itemsApi = {
  list: (params?: { keyword?: string; categoryId?: string; locationId?: string; page?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.keyword) query.set("keyword", params.keyword);
    if (params?.categoryId) query.set("categoryId", params.categoryId);
    if (params?.locationId) query.set("locationId", params.locationId);
    if (params?.page) query.set("page", String(params.page));
    if (params?.pageSize) query.set("pageSize", String(params.pageSize));
    const qs = query.toString();
    return api.get<ItemsListResponse>(`/items${qs ? `?${qs}` : ""}`);
  },
  getById: (id: string) => api.get<Item>(`/items/${id}`),
  create: (data: Partial<Item>) => api.post<Item>("/items", data),
  update: (id: string, data: Partial<Item>) => api.patch<Item>(`/items/${id}`, data),
  delete: (id: string) => api.delete(`/items/${id}`),
};
