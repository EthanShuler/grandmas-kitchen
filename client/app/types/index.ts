export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
}

export interface Recipe {
  id: number;
  title: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  created_by?: number;
  author?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  image_url?: string;
  instructions?: string;
  ingredients?: RecipeIngredient[];
  steps?: Step[];
  tags?: Tag[];
}

export interface Ingredient {
  id: number;
  name: string;
  created_at: string;
}

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_id: number;
  name: string;
  amount?: number;
  unit?: string;
  order_index: number;
}

export interface Step {
  id: number;
  recipe_id: number;
  instruction: string;
  order_index: number;
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateRecipeInput {
  title: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  notes?: string;
  image_url?: string;
  instructions?: string;
  ingredients: Array<{
    name: string;
    amount?: number;
    unit?: string;
  }>;
  steps: string[];
  tags: string[];
}
