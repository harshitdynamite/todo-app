namespace TodoApp.Models;

public enum Priority
{
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}

public enum Status
{
    Todo,
    InProgress,
    Done
}

public class TodoItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Priority Priority { get; set; } = Priority.Medium;
    public Status Status { get; set; } = Status.Todo;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class CreateTodoRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Priority Priority { get; set; } = Priority.Medium;
    public Status Status { get; set; } = Status.Todo;
}

public class UpdateTodoRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Priority Priority { get; set; } = Priority.Medium;
    public Status Status { get; set; } = Status.Todo;
}
