You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.


## TypeScript Best Practices


- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain


## Angular Best Practices


- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
- `NgOptimizedImage` does not work for inline base64 images.


## Components


- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead


## State Management


- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead


## Templates


- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables


## Services


- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection


## SSR Considerations
- Ensure components work with SSR
- Use platform-specific code checks when necessary
- Test both client and server rendering


## Routing
- Configure routes in `app.routes.ts`
- Use lazy loading for feature modules
- Implement proper route guards when needed


### File Organization
- Group related files by feature/page
- Keep components small and focused
- Separate concerns: logic (.ts), template (.html), styles (.scss)
- Use descriptive, kebab-case file names


### Design System & Style Reuse


**Overview:**
Establish a comprehensive design system in `src/styles.scss` to ensure consistent styling across the application and promote code reusability. All reusable styles, design tokens, and utility classes should be centralized here.

### Styling Standards
- Use SCSS for all styling
- Component-specific styles in separate `.scss` files
- Global styles in `src/styles.scss`
- Follow Prettier configuration:
  - Print width: 100 characters
  - Single quotes
  - Angular parser for HTML files


### Typography & Font Guidelines

**Font Specifications:**
- **Primary UI Font:** Inter - Use for all interface elements, body text, buttons, forms, and general UI components
- **Brand Title Font:** Ubuntu - Use exclusively for the main application title to provide a distinct, warm, and contemporary feel

**Font Usage Rules:**
- **Never** use Ubuntu font for anything other than the main title
- **Always** use DM Sans for UI elements: buttons, forms, navigation, body text, headings (except main title)
- Use appropriate font weights: DM Sans supports 100-1000, Ubuntu supports 300-700
- Optimize loading with `font-display: swap` for better performance
