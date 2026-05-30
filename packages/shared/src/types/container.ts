export type LocationType = "house" | "room" | "furniture" | "container";

export interface ContainerDto {
  id: string;
  name: string;
  parentId: string | null;
  type: LocationType;
  qrCode: string | null;
  photoPath: string | null;
  conditions: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContainerDto {
  name: string;
  parentId?: string;
  type: LocationType;
  conditions?: Record<string, string>;
}

export type UpdateContainerDto = Partial<CreateContainerDto>;
