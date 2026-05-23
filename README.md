# Taskflow — Todo App

A clean ASP.NET Core todo app used as the test repository for the GitHub Issue Resolver demo.

## Features

- Add tasks with title, description, priority, and status
- Cards sorted by priority (Critical → High → Medium → Low)
- Distinct color per priority level
- Inline status update from the card
- Edit and delete via modal
- Filter by status or priority
- In-memory store (no DB needed)

## Stack

- ASP.NET Core 10 Minimal API
- Vanilla JS + CSS (no framework dependencies)
- Google Fonts: Syne + DM Sans

## Run

```bash
dotnet run
```

Open `https://localhost:5001` in your browser.

## Priority color scheme

| Priority | Color  |
|----------|--------|
| Critical | Red    |
| High     | Orange |
| Medium   | Yellow |
| Low      | Green  |

## API endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET    | /api/todos | Get all todos (sorted by priority) |
| GET    | /api/todos/{id} | Get single todo |
| POST   | /api/todos | Create todo |
| PUT    | /api/todos/{id} | Update todo |
| PATCH  | /api/todos/{id}/status | Update status only |
| DELETE | /api/todos/{id} | Delete todo |
