export interface Industry {
  id: string;
  name: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  display_order: number;
}

export interface ServiceMenu {
  id: string;
  category_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  base_price?: number;
  description?: string;
  is_active: boolean;
}

export interface IndustriesResponse {
  all: Industry[];
  selected: string[]; // IDs
}
