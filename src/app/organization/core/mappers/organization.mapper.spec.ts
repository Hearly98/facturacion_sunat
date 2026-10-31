import { OrganizationMapper } from './organization.mapper';
import { OrganizationDto } from '../dtos';
import { UpdateOrganization } from '../models';

describe('OrganizationMapper · ubigeo', () => {
  const mapper = new OrganizationMapper();

  it('lee el ubigeo del domicilio fiscal (columna codigoUbigeo del backend)', () => {
    expect(mapper.fromApi({ codigoUbigeo: '150101' } as OrganizationDto).ubigeo).toBe('150101');
  });

  it('lo envía como codigo_ubigeo al actualizar', () => {
    expect(mapper.toApiUpdate({ id: 1, ubigeo: '150101' } as UpdateOrganization).codigo_ubigeo).toBe('150101');
  });
});
