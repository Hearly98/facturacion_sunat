import { mapFilterParams } from './map-filter-params';
import { FilterForm } from '../core/types/filter-form';

describe('mapFilterParams', () => {
  it('should always include page and limit', () => {
    const form: FilterForm = {
      status: null,
      searchTerm: null,
      page: 1,
      limit: 10,
    };

    const result = mapFilterParams(form);

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('should include status when provided', () => {
    const form: FilterForm = {
      status: 'enviada',
      searchTerm: null,
      page: 1,
      limit: 10,
    };

    const result = mapFilterParams(form);

    expect(result.status).toBe('enviada');
  });

  it('should not include status when not provided', () => {
    const form: FilterForm = {
      status: null,
      searchTerm: null,
      page: 1,
      limit: 10,
    };

    const result = mapFilterParams(form);

    expect(result.status).toBeUndefined();
  });

  it('should include search when searchTerm provided', () => {
    const form: FilterForm = {
      status: null,
      searchTerm: 'F001',
      page: 1,
      limit: 10,
    };

    const result = mapFilterParams(form);

    expect(result.search).toBe('F001');
  });

  it('should not include search when searchTerm not provided', () => {
    const form: FilterForm = {
      status: null,
      searchTerm: null,
      page: 1,
      limit: 10,
    };

    const result = mapFilterParams(form);

    expect(result.search).toBeUndefined();
  });

  it('should include all parameters when all provided', () => {
    const form: FilterForm = {
      status: 'error_envio',
      searchTerm: 'test',
      page: 2,
      limit: 20,
    };

    const result = mapFilterParams(form);

    expect(result).toEqual({
      page: 2,
      limit: 20,
      status: 'error_envio',
      search: 'test',
    });
  });

  it('should handle empty search term as not provided', () => {
    const form: FilterForm = {
      status: 'emitida',
      searchTerm: '',
      page: 1,
      limit: 10,
    };

    const result = mapFilterParams(form);

    expect(result.search).toBeUndefined();
    expect(result.status).toBe('emitida');
  });
});
