import { api } from "./client";

export interface AiNotesResult {
  notes: string;
  storageRequirements: Record<string, string> | null;
  shelfLife: string | null;
  source: string;
}

export interface AiDisposalResult {
  suggestions: { platform: string; reason: string }[];
}

export interface AiIdentifyResult {
  name: string;
  notes: string;
  storageRequirements: Record<string, string> | null;
  source: string;
}

export const aiApi = {
  suggestNotes: (itemName: string, category?: string) =>
    api.post<AiNotesResult>("/ai/suggest-notes", { itemName, category }),
  suggestDisposal: (itemName: string, category?: string, condition?: string) =>
    api.post<AiDisposalResult>("/ai/suggest-disposal", { itemName, category, condition }),
  identify: (imageBase64: string) =>
    api.post<AiIdentifyResult>("/ai/identify", { imageBase64 }),
};
