const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeader(): Record<string, string> {
    if (typeof window === 'undefined') {
      return {};
    }
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(username: string, email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Recipes
  async getRecipes(search?: string) {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/recipes${params}`);
  }

  async getRecipe(id: number) {
    return this.request(`/recipes/${id}`);
  }

  async createRecipe(data: any) {
    return this.request('/recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRecipe(id: number, data: any) {
    return this.request(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRecipe(id: number) {
    return this.request(`/recipes/${id}`, {
      method: 'DELETE',
    });
  }

  // Ingredients
  async getIngredients() {
    return this.request('/ingredients');
  }

  // Tags
  async getTags() {
    return this.request('/tags');
  }

  async getRecipesByTag(tagId: number) {
    return this.request(`/tags/${tagId}/recipes`);
  }

  // Favorites
  async getFavorites() {
    return this.request('/favorites');
  }

  async addFavorite(recipeId: number) {
    return this.request(`/favorites/${recipeId}`, {
      method: 'POST',
    });
  }

  async removeFavorite(recipeId: number) {
    return this.request(`/favorites/${recipeId}`, {
      method: 'DELETE',
    });
  }

  async checkFavorite(recipeId: number) {
    return this.request(`/favorites/check/${recipeId}`);
  }
}

export const api = new ApiClient(API_BASE_URL);
