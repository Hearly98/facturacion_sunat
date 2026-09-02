import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    jasmine.clock().install();
    service = new LoadingService();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('does not show loading before the debounce delay', () => {
    service.show();
    jasmine.clock().tick(299);

    expect(service.loading()).toBe(false);
  });

  it('shows loading after the debounce delay if still pending', () => {
    service.show();
    jasmine.clock().tick(300);

    expect(service.loading()).toBe(true);
  });

  it('does not show loading if the request completes before the delay', () => {
    service.show();
    jasmine.clock().tick(100);
    service.hide();
    jasmine.clock().tick(300);

    expect(service.loading()).toBe(false);
  });

  it('stays loading while any of several concurrent requests is still pending', () => {
    service.show();
    service.show();
    jasmine.clock().tick(300);
    service.hide();

    expect(service.loading()).toBe(true);

    service.hide();

    expect(service.loading()).toBe(false);
  });
});
