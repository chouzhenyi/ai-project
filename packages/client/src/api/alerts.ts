import { api } from "./client";

export interface Alert {
  id: string;
  itemId: string | null;
  type: "expiry" | "condition_mismatch" | "low_stock";
  message: string;
  severity: "info" | "warning" | "critical";
  resolved: boolean;
  createdAt: string;
}

export interface AlertSummary {
  total: number;
  unresolved: number;
  bySeverity: { critical: number; warning: number; info: number };
}

export const alertsApi = {
  list: (resolved?: boolean) => {
    const qs = resolved !== undefined ? `?resolved=${resolved}` : "";
    return api.get<Alert[]>(`/alerts${qs}`);
  },
  summary: () => api.get<AlertSummary>("/alerts/summary"),
  resolve: (id: string) => api.patch(`/alerts/${id}/resolve`, {}),
};
