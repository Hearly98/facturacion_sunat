# AGENTS.md — factu-front

> Angular 20.x standalone app · CoreUI + Bootstrap · Karma/Jasmine

## Build / Dev / Test Commands

```bash
npm start              # ng serve (dev server)
npm run start:prod     # ng serve --configuration production
npm run build          # ng build (dev)
npm run build-prod     # ng build --configuration production
npm test               # ng test (Karma, watches all tests)
```

### Running a single test

```bash
ng test --include=src/app/customer/pages/customer.page.spec.ts
ng test --include='src/app/**/*.spec.ts'   # glob pattern
```

In spec files, use `fit` / `fdescribe` to focus individual cases.

### Storybook

```bash
npm run storybook        # start Storybook on :6006
npm run build-storybook  # build static
```

### Compodoc (auto-generated for Storybook)

Compodoc runs automatically with Storybook. To generate docs manually:
```bash
npx compodoc -p tsconfig.app.json -d .
```

## Code Style & Conventions

### TypeScript

- **Strict mode** enabled (`strict: true` in tsconfig.json)
- `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch` all true
- `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers` enabled
- Target: ES2022, module: preserve

### Imports

- Use path aliases: `@shared/*` → `src/app/shared/*`, `@environments/*` → `src/environments/*`
- Angular imports first, then third-party, then relative imports
- Barrel exports via `index.ts` in `helpers/`, `models/`, `types/`, `core/` directories

### Formatting (Prettier)

- `printWidth: 100`
- `singleQuote: true`
- HTML uses `angular` parser

### Naming Conventions

| Artifact | Convention | Example |
|----------|-----------|---------|
| Components | `PascalCase` + `Component` suffix or feature name | `BrandComponent`, `CustomerPage` |
| Services | `PascalCase` + `Service` suffix | `BrandService` |
| Models/DTOs | `PascalCase` + `.model.ts` or `.dto.ts` | `GetMarcaModel`, `ResponseDto` |
| Helpers | `camelCase` functions, `PascalCase` constants | `buildBrandForm()`, `brandStructure` |
| Files | kebab-case for dirs, feature name for files | `brand-new-edit-modal/brand-new-edit-modal.ts` |
| Private fields | `#` prefix for inject() | `readonly #brandService = inject(BrandService)` |

### Component Architecture

- **Standalone components only** (`standalone: true` in schematics)
- **Inline style + inline template** by default (per angular.json schematics)
- **Flat structure** for generated components
- **SCSS** for styles
- Prefix: `app`

### Feature Module Structure

```
src/app/<feature>/
├── core/
│   ├── models/       # DTOs, barrel via index.ts
│   ├── services/     # @Injectable({ providedIn: 'root' })
│   └── types/        # TypeScript interfaces/types
├── helpers/          # Form builders, mappers, structures, error messages
├── pages/            # Page/route components
└── components/       # Reusable feature components
```

### Services

- Extend `BaseService` from `@shared/services/base.service`
- Constructor calls `super(http, \`${environment.apiUrl}/resource\`)`
- Methods use `getRequest`, `postRequest`, `putRequest`, `deleteRequest`
- Return typed `Observable<ResponseDto<T>>`
- `@Injectable({ providedIn: 'root' })`

### Pages (Search/List)

- Extend `BaseSearchComponent` from `@shared/base/search-base.component`
- Implement `OnInit`, call `createForm()` and `onSearch()` in `ngOnInit`
- Use `TypedFormGroup<FilterForm>` for typed reactive forms
- Inject services with `readonly #service = inject(ServiceName)`
- Manage subscriptions via `this.subscriptions.push(subscription)`

### Forms

- Use helper functions: `buildXxxForm()` returns form control map
- Use `TypedFormGroup<T>` from `@shared/types/types-form`
- Form structures defined as const arrays (`xxxStructure`)
- Error messages in `xxx-error-messages.ts`
- Validators via `Validators.compose([...])`

### Error Handling

- Use `GlobalNotification` for toast/alert feedback
- Use `ConfirmService` for confirmation dialogs
- Check `response.isValid` on API responses
- Handle `error` callback on subscriptions with user-facing messages

### Models

- Use **classes** (not interfaces) for DTOs with default values
- Separate models: `GetXxxModel`, `CreateXxxModel`, `UpdateXxxModel`
- Barrel export via `index.ts`

### Styling

- SCSS via `styleUrl: './component.scss'`
- CoreUI Angular components + Bootstrap 5
- Global styles in `src/styles.scss`

### Routing

- Lazy loading via `loadComponent` with dynamic imports
- Auth guards: `authGuard`, `guestGuard`
- Route data includes `title` for breadcrumbs/nav

## Skills

| Skill | Description | Path |
|-------|-------------|------|
| `ux-flow-review` | On-demand UX/flow + color-palette audit, delegated to sub-agents. Separate, opt-in track — never runs automatically as part of the regular fix/test workflow. | [SKILL.md](.claude/skills/ux-flow-review/SKILL.md) |
