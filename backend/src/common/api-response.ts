/**
 * Standardized API response wrapper.
 */
export class ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    meta?: PaginationMeta;

    static ok<T>(data: T, message?: string): ApiResponse<T> {
        return { success: true, data, message };
    }

    static paginated<T>(data: T, meta: PaginationMeta): ApiResponse<T> {
        return { success: true, data, meta };
    }

    static error(message: string): ApiResponse<null> {
        return { success: false, message };
    }
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
}

export function paginate(page: number, limit: number, total: number): PaginationMeta {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
}
