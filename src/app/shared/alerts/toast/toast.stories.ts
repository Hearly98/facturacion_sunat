import { moduleMetadata, StoryObj, Meta } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';

// Import the component that you already have
import { AppToastComponent } from './toast.component';

export default {
    title: 'Shared/Toast',
    component: AppToastComponent,
    decorators: [
        // Make sure any Angular modules your component depends on are imported
        moduleMetadata({
            imports: [CommonModule, IconDirective], // add more if needed
        }),
    ],
    // Enable controls for all @Input properties
    argTypes: {
        closeButton: { control: 'boolean' },
        title: { control: 'text' },
        message: { control: 'text' },
        color: {
            control: {
                type: 'select',
                options: ['success', 'info', 'warning', 'danger'],
            },
        },
    },
} as Meta<AppToastComponent>;


export type Story = StoryObj<AppToastComponent>;

/**
 * Default story – just the component with its default inputs
 */
export const Default: Story = {
    args: {
        closeButton: true,
        title: 'Success',
        message: 'The operation completed successfully.',
        color: 'success',
    }
};
/**
 * Variant: Warning toast
 */
export const Warning: Story = {
    args: {
        closeButton: true,
        title: 'Warning',
        message: 'Please check your input.',
        color: 'warning',
    }
};

/**
 * Variant: Danger toast (error)
 */
export const Danger: Story = {
    args: {
        closeButton: true,
        title: 'Error',
        message: 'Something went wrong!',
        color: 'danger',
    }
};

/**
 * Variant: Info toast
 */
export const Info = {
    args: {
        closeButton: true,
        title: 'Info',
        message: 'Here is some information for you.',
        color: 'info',
    }
};
/**
 * Variant: Toast without a close button
 */
export const NoCloseButton = {
    args: {
        ...Default.args,
        closeButton: false,
    }
};