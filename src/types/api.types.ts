
// Product types
export interface Product {
  id: string;
  title: string;
  description: string;
}

export interface ProductCreateInput {
  title: string;
  description: string;
}

// Item types
export interface Item {
  id: string;
  title: string;
  product_id: string;
}

export interface ItemCreateInput {
  title: string;
  product_id: string;
}

// Subitem types
export interface Subitem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  item_id: string;
  last_updated_by?: string;
  last_updated_at?: string;
  hidden?: boolean;
}

export interface SubitemCreateInput {
  title: string;
  subtitle?: string;
  description: string;
  lastUpdatedBy?: string;
}

// Scenario types
export interface Scenario {
  id: string;
  title: string;
  description: string;
  formatted_description?: string;
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
}

export interface ScenarioCreateInput {
  title: string;
  description: string;
  formattedDescription?: string;
}

// Scenario item types
export interface ScenarioItem {
  scenario_id: string;
  item_id: string;
  created_by?: string;
  created_at?: string;
}
