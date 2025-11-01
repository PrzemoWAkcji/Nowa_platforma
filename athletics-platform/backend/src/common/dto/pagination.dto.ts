import { IsOptional, IsPositive, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsPositive({ message: 'Numer strony musi być liczbą dodatnią' })
  @Min(1, { message: 'Numer strony musi być co najmniej 1' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsPositive({ message: 'Limit musi być liczbą dodatnią' })
  @Min(1, { message: 'Limit musi być co najmniej 1' })
  @Max(100, { message: 'Limit nie może przekraczać 100' })
  limit?: number = 10;

  get skip(): number {
    return ((this.page || 1) - 1) * (this.limit || 10);
  }

  get take(): number {
    return this.limit || 10;
  }
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

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}