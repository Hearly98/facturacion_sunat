import { FormControl } from '@angular/forms';
import { FilterForm } from '../core/types';

export const buildFilterForm = (): {
    [K in keyof FilterForm]: FormControl<FilterForm[K] | any>;
} => {
    return {
        nombre: new FormControl(null),
        sucursalId: new FormControl(null),
        order: new FormControl('desc'),
    };
};
