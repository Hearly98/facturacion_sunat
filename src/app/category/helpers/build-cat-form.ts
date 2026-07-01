import { CategoryForm } from "../core/types/cat-form";
import { FormControl, Validators } from "@angular/forms";

export const buildCategoryForm = (): {
    [K in keyof CategoryForm]: FormControl<CategoryForm[K]>
} =>
{
  return {
    id: new FormControl(null),
    nombre: new FormControl(null, Validators.required)
  };
}
