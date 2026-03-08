import type { Recipe, User, Tag, CreateRecipeInput, AuthResponse } from '@/types';

// Use localhost for SSR (server-side), relative URL for browser (client-side)
const API_BASE_URL = typeof window === 'undefined'
  ? 'http://localhost:3001/api'  // SSR: direct connection
  : '/api';  // Browser: relative URL through Nginx/Vite proxy

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeader(token?: string): Record<string, string> {
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    if (typeof window === 'undefined') {
      return {};
    }
    const storedToken = localStorage.getItem('token');
    return storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { token?: string } = {}
  ): Promise<T> {
    const { token, ...fetchOptions } = options;
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(token),
      ...fetchOptions.headers,
    };

    try {
      const response = await fetch(url, { ...fetchOptions, headers });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', {
        url,
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Recipes
  async getRecipes(search?: string, tags?: string[]): Promise<Recipe[]> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (tags?.length) params.set('tags', tags.join(','));
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<Recipe[]>(`/recipes${qs}`);
  }

  async getRecipe(id: number): Promise<Recipe> {
    return this.request<Recipe>(`/recipes/${id}`);
  }

  async createRecipe(data: CreateRecipeInput): Promise<Recipe> {
    return this.request<Recipe>('/recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRecipe(id: number, data: CreateRecipeInput): Promise<Recipe> {
    return this.request<Recipe>(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRecipe(id: number): Promise<void> {
    return this.request<void>(`/recipes/${id}`, { method: 'DELETE' });
  }

  // Users
  async getUser(id: number): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async getUserByUsername(username: string): Promise<User> {
    return this.request<User>(`/users/username/${username}`);
  }

  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async deleteUser(userId: number): Promise<void> {
    return this.request<void>(`/users/${userId}`, { method: 'DELETE' });
  }

  async getUserRecipes(userId: number): Promise<Recipe[]> {
    return this.request<Recipe[]>(`/users/${userId}/recipes`);
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    return this.request<Tag[]>('/tags');
  }

  // Favorites
  async getFavorites(): Promise<Recipe[]> {
    return this.request<Recipe[]>('/favorites');
  }

  async getFavoriteIds(): Promise<{ ids: number[] }> {
    return this.request<{ ids: number[] }>('/favorites/ids');
  }

  async addFavorite(recipeId: number): Promise<void> {
    return this.request<void>(`/favorites/${recipeId}`, { method: 'POST' });
  }

  async removeFavorite(recipeId: number): Promise<void> {
    return this.request<void>(`/favorites/${recipeId}`, { method: 'DELETE' });
  }

  async checkFavorite(recipeId: number): Promise<{ is_favorited: boolean }> {
    return this.request<{ is_favorited: boolean }>(`/favorites/check/${recipeId}`);
  }
}

export const api = new ApiClient(API_BASE_URL);
