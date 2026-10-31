import { Component } from '@angular/core';
import { ColComponent, RowComponent } from '@coreui/angular';
import { SunatConfigCardComponent } from 'src/app/sunat/components/sunat-config-card.component';
import { SendingPolicyCardComponent } from '../components/sending-policy-card.component';

@Component({
  selector: 'app-emissions-settings-page',
  standalone: true,
  imports: [RowComponent, ColComponent, SendingPolicyCardComponent, SunatConfigCardComponent],
  template: `
    <c-row class="mb-3">
      <c-col>
        <h4 class="mb-0">Configuración de emisiones</h4>
        <p class="text-body-secondary small mb-0">Cuándo y con qué credenciales se envían los comprobantes a SUNAT</p>
      </c-col>
    </c-row>
    <app-sending-policy-card></app-sending-policy-card>
    <app-sunat-config-card></app-sunat-config-card>
  `,
})
export class EmissionsSettingsPage {}
