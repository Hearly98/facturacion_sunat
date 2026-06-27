import { FormArray, FormControl, FormGroup } from "@angular/forms"
import { SaleForm } from "../core/types/sale-form"
import { SaleDetailForm } from "src/app/sale-detail/core/types/sale-detail.form"

export const buildSaleForm = (): {
    [k in keyof Omit<SaleForm, 'detalles'>]: FormControl<SaleForm[k]>;
} & { detalles: FormArray<FormGroup<any>> } => {
    return {
        venta_id: new FormControl(null),
        cli_id: new FormControl(null),
        afecta_stock: new FormControl(true),
        cot_id: new FormControl(null),
        detalles: new FormArray<FormGroup<any>>([]),
        doc_id: new FormControl(null),
        emp_id: new FormControl(null),
        estado_id: new FormControl(null),
        fecha_emision: new FormControl({ value: new Date().toISOString().split('T')[0], disabled: true }),
        fecha_vencimiento: new FormControl(null),
        guia_id: new FormControl(null),
        mon_id: new FormControl(null),
        monto_acuenta: new FormControl(null),
        monto_pendiente: new FormControl(null),
        mp_cod: new FormControl(null),
        serie_id: new FormControl(null),
        suc_id: new FormControl(null),
        almacen_id: new FormControl(null),
        vendedor_id: new FormControl(null),
        venta_coment: new FormControl(null),
        venta_descuento: new FormControl(null),
        venta_igv: new FormControl(null),
        venta_subtotal: new FormControl(null),
        venta_total: new FormControl(null),
        cli_documento: new FormControl(null),
        cli_direcc: new FormControl(null),
        cli_correo: new FormControl(null),
        cli_telf: new FormControl(null),
        tip_id: new FormControl(null),
        prod_id: new FormControl(null),
    }
}