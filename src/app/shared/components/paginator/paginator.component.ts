import { Component, Input, Output, EventEmitter } from '@angular/core';
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

  // Getters en vez de computed(): total/pageSize/page son @Input() planos, no signals, y
  // computed() solo re-evalua cuando lee OTROS signals -- con un @Input() plano queda pegado
  // al primer valor que vio (normalmente 0/undefined en el primer render) y nunca se actualiza.
  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize) || 1;
  }

  get firstItem(): number {
    if (this.total === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get lastItem(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  /** Números de página a mostrar, con '...' donde hay un salto. Siempre incluye primera y última. */
  get pageNumbers(): (number | '...')[] {
    const total = this.totalPages;
    const current = this.page;
    const delta = 1;

    if (total <= 1) return [1];

    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    const range: (number | '...')[] = [1];
    if (left > 2) range.push('...');
    for (let p = left; p <= right; p++) range.push(p);
    if (right < total - 1) range.push('...');
    range.push(total);

    return range;
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }
}
