export const registerStructure = () => {
    return {
        title: 'Crear cuenta',
        description: 'Registrate y empezá a probar el sistema',
        forms: [
            {
                name: 'nombre',
                label: 'Nombre',
                formControlName: 'nombre',
                formControlType: 'text',
                placeholder: 'Nombre',
                icon: 'cilUser'
            },
            {
                name: 'apellido',
                label: 'Apellido',
                formControlName: 'apellido',
                formControlType: 'text',
                placeholder: 'Apellido',
                icon: 'cilUser'
            },
            {
                name: 'email',
                label: 'Correo electrónico',
                formControlName: 'email',
                formControlType: 'email',
                placeholder: 'correo@empresa.com',
                icon: 'cilEnvelopeOpen'
            },
            {
                name: 'password',
                label: 'Contraseña',
                formControlName: 'password',
                formControlType: 'password',
                placeholder: '••••••••',
                icon: 'cilLockLocked'
            },
            {
                name: 'password_confirmation',
                label: 'Confirmar contraseña',
                formControlName: 'password_confirmation',
                formControlType: 'password',
                placeholder: '••••••••',
                icon: 'cilLockLocked'
            },
            {
                name: 'nombre_empresa',
                label: 'Nombre de tu empresa',
                formControlName: 'nombre_empresa',
                formControlType: 'text',
                placeholder: 'Nombre de tu empresa',
                icon: 'cilBuilding'
            },
            {
                name: 'ruc',
                label: 'RUC',
                formControlName: 'ruc',
                formControlType: 'text',
                placeholder: 'RUC',
                icon: 'cilDescription'
            },
        ],
    }
}
