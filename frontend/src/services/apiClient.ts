const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface ApiError {
  message: string;
  field?: string;
  errors?: Record<string, string[]>;
}

interface TokenPair {
  access: string;
  refresh: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getTokens(): TokenPair | null {
    const tokens = localStorage.getItem('auth_tokens');
    return tokens ? JSON.parse(tokens) : null;
  }

  private setTokens(tokens: TokenPair): void {
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  }

  private clearTokens(): void {
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('auth:logout'));
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const tokens = this.getTokens();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (tokens?.access) {
      headers['Authorization'] = `Bearer ${tokens.access}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && tokens?.refresh) {
      const refreshed = await this.refreshToken(tokens.refresh);
      if (refreshed) {
        headers['Authorization'] = `Bearer ${refreshed.access}`;
        const retryResponse = await fetch(url, { ...options, headers });
        if (!retryResponse.ok) {
          throw await this.handleError(retryResponse);
        }
        return retryResponse.json();
      }
    }

    if (!response.ok) {
      throw await this.handleError(response);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }

  private async handleError(response: Response): Promise<ApiError> {
    let errorData: Record<string, unknown>;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: response.statusText };
    }

    if (errorData.detail) {
      return { message: String(errorData.detail) };
    }

    const errors: Record<string, string[]> = {};
    let firstMessage = 'An error occurred';

    for (const [key, value] of Object.entries(errorData)) {
      if (Array.isArray(value)) {
        errors[key] = value.map(String);
        if (firstMessage === 'An error occurred') {
          firstMessage = value[0];
        }
      } else if (typeof value === 'string') {
        errors[key] = [value];
        if (firstMessage === 'An error occurred') {
          firstMessage = value;
        }
      }
    }

    return { message: firstMessage, errors };
  }

  private async refreshToken(refreshToken: string): Promise<TokenPair | null> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const tokens = await response.json();
      this.setTokens(tokens);
      return tokens;
    } catch {
      this.clearTokens();
      return null;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  saveTokens(tokens: TokenPair): void {
    this.setTokens(tokens);
  }

  removeTokens(): void {
    this.clearTokens();
  }

  hasTokens(): boolean {
    return this.getTokens() !== null;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiError, TokenPair };
