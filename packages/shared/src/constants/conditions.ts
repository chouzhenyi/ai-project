export const STORAGE_CONDITIONS = [
  "常温",
  "冷藏",
  "冷冻",
  "阴凉",
  "干燥",
  "避光",
  "防潮",
] as const;

export interface StorageRequirements {
  temperature?: string;
  humidity?: string;
  other?: string[];
}
