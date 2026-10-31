import { ProductMapper } from './product.mapper';
import { ProductDto } from '../dto/product.dto';
import { CreateProduct } from '../models';

describe('ProductMapper · afectación IGV', () => {
  it('lee tipo_afectacion_igv y asume gravado si no viene', () => {
    expect(ProductMapper.fromApi({ tipo_afectacion_igv: '20' } as ProductDto).igvAffectation).toBe('20');
    expect(ProductMapper.fromApi({} as ProductDto).igvAffectation).toBe('10');
  });

  it('envía tipo_afectacion_igv en el alta (JSON y multipart)', () => {
    const model = { name: 'Libro', igvAffectation: '20' } as CreateProduct;

    expect(ProductMapper.toApiCreate(model).tipo_afectacion_igv).toBe('20');
    expect(ProductMapper.toFormDataCreate(model).get('tipo_afectacion_igv')).toBe('20');
  });
});
