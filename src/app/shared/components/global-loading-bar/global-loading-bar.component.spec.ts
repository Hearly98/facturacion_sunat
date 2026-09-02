import { TestBed } from '@angular/core/testing';
import { GlobalLoadingBarComponent } from './global-loading-bar.component';
import { LoadingService } from 'src/app/core/services/loading.service';

describe('GlobalLoadingBarComponent', () => {
  it('renders nothing when not loading', () => {
    const fixture = TestBed.createComponent(GlobalLoadingBarComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.global-loading-bar')).toBeNull();
  });

  it('renders the bar once LoadingService reports loading', () => {
    jasmine.clock().install();
    const fixture = TestBed.createComponent(GlobalLoadingBarComponent);
    const loadingService = TestBed.inject(LoadingService);

    loadingService.show();
    jasmine.clock().tick(300);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.global-loading-bar')).not.toBeNull();
    jasmine.clock().uninstall();
  });
});
