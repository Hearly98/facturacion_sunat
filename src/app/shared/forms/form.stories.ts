import type { Meta, StoryObj } from '@storybook/angular';

import { FormComponent } from './form.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';

// El paquete `storybook` (que provee `storybook/test`) no está instalado en este proyecto
// -- solo los paquetes @storybook/* con scope -- así que las aserciones del play() se hacen
// con un assert nativo en vez de depender de una dependencia inexistente.
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function createForm(): FormGroup {
  return new FormGroup({
    firstName: new FormControl('', Validators.required),
  });
}

const meta: Meta<FormComponent> = {
  title: 'FormControl',
  component: FormComponent,
  excludeStories: /.*Data$/,
  tags: ['autodocs'],
  args: {
    form: createForm(),
  },
};

export default meta;
type Story = StoryObj<FormComponent>;

export const Default: Story = {
  args: {
    ...meta.args,
  },
  play: ({ args }: { args: { form: FormGroup } }) => {
    assert(args.form.touched === false, 'form should not be touched');
    assert(args.form.dirty === false, 'form should not be dirty');
  },
};

export const Error: Story = {
  args: {
    ...Default.args,
    form: createForm(),
  },
  play: ({ args }: { args: { form: FormGroup } }) => {
    args.form.markAsDirty();
    args.form.markAllAsTouched();
    args.form.updateValueAndValidity();
    assert(args.form.touched === true, 'form should be touched');
    assert(args.form.dirty === true, 'form should be dirty');
  },
};

export const Archived: Story = {
  args: {
    ...Default.args,
    form: createForm(),
  },
};
