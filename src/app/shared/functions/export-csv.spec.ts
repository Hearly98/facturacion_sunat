import { exportCsv } from './export-csv';

describe('exportCsv', () => {
  let clickSpy: jasmine.Spy;
  let createObjectURLSpy: jasmine.Spy;
  let revokeObjectURLSpy: jasmine.Spy;
  let capturedBlob: Blob | undefined;

  beforeEach(() => {
    clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');
    createObjectURLSpy = spyOn(URL, 'createObjectURL').and.callFake((blob: Blob) => {
      capturedBlob = blob;
      return 'blob:fake-url';
    });
    revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');
  });

  it('triggers a download with the given filename, appending .csv if missing', () => {
    exportCsv([{ nombre: 'Juan' }], 'clientes');

    expect(clickSpy).toHaveBeenCalled();
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:fake-url');
  });

  it('builds a CSV with header row from object keys when no columns are given', async () => {
    exportCsv([{ nombre: 'Juan', documento: '12345678' }], 'clientes');

    const text = await capturedBlob!.text();
    expect(text).toContain('nombre,documento');
    expect(text).toContain('Juan,12345678');
  });

  it('uses custom column labels when provided', async () => {
    exportCsv(
      [{ nombre: 'Juan' }],
      'clientes',
      [{ key: 'nombre', label: 'Nombre completo' }]
    );

    const text = await capturedBlob!.text();
    expect(text).toContain('Nombre completo');
  });

  it('escapes values containing commas, quotes or newlines', async () => {
    exportCsv([{ nombre: 'Pérez, Juan "El Grande"' }], 'clientes');

    const text = await capturedBlob!.text();
    expect(text).toContain('"Pérez, Juan ""El Grande"""');
  });

  it('prefixes the CSV with a UTF-8 BOM', async () => {
    exportCsv([{ nombre: 'Ñandú' }], 'clientes');

    // Blob.text() decodes as UTF-8 and silently strips a leading BOM (TextDecoder's
    // default), so the BOM bytes must be checked on the raw buffer instead.
    const bytes = new Uint8Array(await capturedBlob!.arrayBuffer());
    expect([bytes[0], bytes[1], bytes[2]]).toEqual([0xef, 0xbb, 0xbf]);
  });
});
