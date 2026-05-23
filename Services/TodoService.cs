using TodoApp.Models;

namespace TodoApp.Services;

/// <summary>
/// In-memory store for todos. Intentionally simple — no DB dependency
/// so this repo is easy to clone and run as a test target.
/// Todos are always returned sorted by Priority descending (Critical first).
/// </summary>
public class TodoService
{
    private readonly List<TodoItem> _todos = [];
    private readonly object _lock = new();

    public List<TodoItem> GetAll()
    {
        lock (_lock)
        {
            return [.. _todos.OrderByDescending(t => t.Priority).ThenBy(t => t.CreatedAt)];
        }
    }

    public TodoItem? GetById(Guid id)
    {
        lock (_lock)
        {
            return _todos.FirstOrDefault(t => t.Id == id);
        }
    }

    public TodoItem Create(CreateTodoRequest request)
    {
        var item = new TodoItem
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            Status = request.Status
        };

        lock (_lock)
        {
            _todos.Add(item);
        }

        return item;
    }

    public TodoItem? Update(Guid id, UpdateTodoRequest request)
    {
        lock (_lock)
        {
            var item = _todos.FirstOrDefault(t => t.Id == id);
            if (item is null) return null;

            item.Title = request.Title;
            item.Description = request.Description;
            item.Priority = request.Priority;
            item.Status = request.Status;

            return item;
        }
    }

    public bool Delete(Guid id)
    {
        lock (_lock)
        {
            var item = _todos.FirstOrDefault(t => t.Id == id);
            if (item is null) return false;
            _todos.Remove(item);
            return true;
        }
    }

    public TodoItem? UpdateStatus(Guid id, Status status)
    {
        lock (_lock)
        {
            var item = _todos.FirstOrDefault(t => t.Id == id);
            if (item is null) return null;
            item.Status = status;
            return item;
        }
    }
}
