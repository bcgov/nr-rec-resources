import { describe, it, expect } from 'vitest';
import { PaginatedRecreationResourceSummaryDto } from './paginated-recreation-resource-summary.dto';

describe('PaginatedRecreationResourceSummaryDto', () => {
  it('should create a valid DTO instance with all fields', () => {
    const dto = new PaginatedRecreationResourceSummaryDto();
    dto.data = [];
    dto.total = 2500;
    dto.page = 1;
    dto.totalPages = 3;

    expect(dto).toBeDefined();
    expect(dto.data).toEqual([]);
    expect(dto.total).toBe(2500);
    expect(dto.page).toBe(1);
    expect(dto.totalPages).toBe(3);
  });
});
