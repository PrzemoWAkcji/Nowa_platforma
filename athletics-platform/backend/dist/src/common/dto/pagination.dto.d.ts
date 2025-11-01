export declare class PaginationDto {
    page?: number;
    limit?: number;
    get skip(): number;
    get take(): number;
}
export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
export declare function createPaginatedResult<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T>;
