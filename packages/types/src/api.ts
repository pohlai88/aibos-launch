// API types for AI-BOS

export interface ApiRequest {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
    params?: Record<string, string>;
    query?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    statusCode: number;
    headers?: Record<string, string>;
}

export interface ApiError {
    code: string;
    message: string;
    details?: unknown;
    statusCode: number;
}

export interface ApiEndpoint {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    description?: string;
    requiresAuth?: boolean;
    permissions?: string[];
    rateLimit?: {
        windowMs: number;
        maxRequests: number;
    };
}

export interface ApiRoute {
    endpoint: ApiEndpoint;
    handler: (req: ApiRequest) => Promise<ApiResponse>;
    middleware?: Array<(req: ApiRequest) => Promise<ApiRequest>>;
}
