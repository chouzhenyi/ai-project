import { api } from "./client";

export interface Container {
  id: string;
  name: string;
  parentId: string | null;
  type: "house" | "room" | "furniture" | "container";
  qrCode: string | null;
  photoPath: string | null;
  conditions: string | null;
  createdAt: string;
  updatedAt: string;
  items?: { id: string; name: string; quantity: number; unit: string }[];
}

export interface TreeNode {
  id: string;
  name: string;
  parentId: string | null;
  type: string;
  qrCode: string | null;
  photoPath: string | null;
  conditions: string | null;
  createdAt: string;
  updatedAt: string;
  children?: TreeNode[];
}

export const containersApi = {
  list: (params?: { parentId?: string; keyword?: string }) => {
    const query = new URLSearchParams();
    if (params?.parentId) query.set("parentId", params.parentId);
    if (params?.keyword) query.set("keyword", params.keyword);
    const qs = query.toString();
    return api.get<Container[]>(`/containers${qs ? `?${qs}` : ""}`);
  },
  tree: () => api.get<TreeNode[]>(`/containers/tree`),
  getById: (id: string) => api.get<Container & { items: unknown[] }>(`/containers/${id}`),
  create: (data: { name: string; parentId?: string; type: string; conditions?: string }) =>
    api.post<Container>("/containers", data),
  update: (id: string, data: Partial<Container>) =>
    api.patch<Container>(`/containers/${id}`, data),
  delete: (id: string) => api.delete(`/containers/${id}`),
};
