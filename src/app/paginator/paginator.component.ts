import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { ColComponent, RowComponent } from '@coreui/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [RowComponent, ColComponent, CommonModule],
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
})
export class PaginatorComponent {
  @Input() page!: number;
  @Input() pageSize!: number;
  @Input() total!: number;
  @Output() pageChange = new EventEmitter<number>();

  totalPages = computed(() => Math.ceil(this.total / this.pageSize));

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }
}
