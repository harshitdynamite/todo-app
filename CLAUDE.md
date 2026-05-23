# TodoApp — Architecture Guide for Claude

This file is automatically fetched by the GitHub Issue Resolver to give Claude
full codebase context before attempting any fix. Always read this first.

## Project type
ASP.NET Core 9 Web API + Vanilla JS SPA. No frontend framework. No database — fully in-memory.

## File map

| File | Purpose |
|------|---------|
| `Program.cs` | App entry point. Registers services, static files, maps controllers. |
| `TodoApp.csproj` | Project file. No external NuGet packages. |
| `Models/TodoItem.cs` | Core domain model. Contains `TodoItem`, `Priority` enum, `Status` enum, `CreateTodoRequest`, `UpdateTodoRequest`. |
| `Services/TodoService.cs` | In-memory store. Thread-safe with a lock. Always returns todos sorted by Priority descending. All CRUD lives here. |
| `Controllers/TodosController.cs` | REST API controller. Routes: GET /api/todos, GET /api/todos/{id}, POST /api/todos, PUT /api/todos/{id}, PATCH /api/todos/{id}/status, DELETE /api/todos/{id}. |
| `wwwroot/index.html` | Single HTML shell. References `/css/app.css` and `/js/app.js`. Contains the form, filter pills, board div, and edit modal. |
| `wwwroot/css/app.css` | All styling. Uses CSS custom properties (variables) defined in `:root`. Priority colors, card styles, layout, modal, toast. |
| `wwwroot/js/app.js` | All frontend logic. Fetch calls to the API, card rendering, filter state, modal open/close, toast notifications. No framework. |

## Domain model

```
Priority enum: Low = 1, Medium = 2, High = 3, Critical = 4
Status enum:   Todo = 0, InProgress = 1, Done = 2
```

## Priority color system (all in wwwroot/css/app.css)

Each priority has three CSS variables controlling its entire visual appearance:

| Priority | Color var | Background var | Border var |
|----------|-----------|---------------|------------|
| Critical | `--critical` | `--critical-bg` | `--critical-bd` |
| High | `--high` | `--high-bg` | `--high-bd` |
| Medium | `--medium` | `--medium-bg` | `--medium-bd` |
| Low | `--low` | `--low-bg` | `--low-bd` |

### Current values (defined in `:root`)

```css
:root {
  --critical:    #ffffff;                   /* white — changed from #ff4444 red in issue #5 (PR #6) */
  --critical-bg: rgba(255, 255, 255, 0.10);
  --critical-bd: rgba(255, 255, 255, 0.25);

  --high:        #ff8c42;
  --high-bg:     rgba(255, 140, 66, 0.10);
  --high-bd:     rgba(255, 140, 66, 0.25);

  --medium:      #f5c518;
  --medium-bg:   rgba(245, 197, 24, 0.10);
  --medium-bd:   rgba(245, 197, 24, 0.25);

  --low:         #4caf82;
  --low-bg:      rgba(76, 175, 130, 0.10);
  --low-bd:      rgba(76, 175, 130, 0.25);
}
```

> **Note:** Critical is intentionally **white (`#ffffff`)** as of issue #5 (merged in PR #6) — do not "fix" it back to red unless an issue explicitly asks.

Cards use `data-priority` attribute (1-4) to select styles via:
```css
.todo-card[data-priority="4"] { ... }  /* Critical */
.todo-card[data-priority="3"] { ... }  /* High */
.todo-card[data-priority="2"] { ... }  /* Medium */
.todo-card[data-priority="1"] { ... }  /* Low */
```

Badges use classes: `.badge--critical`, `.badge--high`, `.badge--medium`, `.badge--low`

## Card rendering (wwwroot/js/app.js)

Cards are built by `buildCard(todo)` function. Each card has:
- `data-priority` attribute = todo.priority (1-4)
- `data-status` attribute = todo.status (0-2)
- Priority badge, status badge, title, description, footer with date + inline status select

Sorting happens in `TodoService.GetAll()` server-side (Priority desc, CreatedAt asc),
and also re-applied client-side after add/edit in `app.js`.

## API response shape

```json
{
  "id": "guid",
  "title": "string",
  "description": "string",
  "priority": 4,
  "status": 0,
  "createdAt": "2026-05-23T00:00:00Z"
}
```

## Common bug locations by issue type

| Issue type | Files to check |
|------------|---------------|
| Card color / styling | `wwwroot/css/app.css` |
| Card not rendering / wrong data | `wwwroot/js/app.js` → `buildCard()` |
| Sort order wrong | `Services/TodoService.cs` → `GetAll()` |
| API returning wrong data | `Controllers/TodosController.cs`, `Services/TodoService.cs` |
| Priority / status values wrong | `Models/TodoItem.cs` |
| Filter not working | `wwwroot/js/app.js` → `renderBoard()` |
| Modal not saving | `wwwroot/js/app.js` → `btn-save` click handler |
| App not starting | `Program.cs`, `TodoApp.csproj` |
