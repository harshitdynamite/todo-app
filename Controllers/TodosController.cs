using Microsoft.AspNetCore.Mvc;
using TodoApp.Models;
using TodoApp.Services;

namespace TodoApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TodosController : ControllerBase
{
    private readonly TodoService _service;

    public TodosController(TodoService service) => _service = service;

    [HttpGet]
    public ActionResult<List<TodoItem>> GetAll() =>
        Ok(_service.GetAll());

    [HttpGet("{id:guid}")]
    public ActionResult<TodoItem> GetById(Guid id)
    {
        var item = _service.GetById(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public ActionResult<TodoItem> Create([FromBody] CreateTodoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { error = "Title is required" });

        var item = _service.Create(request);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id:guid}")]
    public ActionResult<TodoItem> Update(Guid id, [FromBody] UpdateTodoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { error = "Title is required" });

        var item = _service.Update(id, request);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPatch("{id:guid}/status")]
    public ActionResult<TodoItem> UpdateStatus(Guid id, [FromBody] StatusUpdateRequest request)
    {
        var item = _service.UpdateStatus(id, request.Status);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpDelete("{id:guid}")]
    public IActionResult Delete(Guid id)
    {
        var deleted = _service.Delete(id);
        return deleted ? NoContent() : NotFound();
    }
}

public class StatusUpdateRequest
{
    public Status Status { get; set; }
}
