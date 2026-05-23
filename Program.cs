using TodoApp.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<TodoService>();

var app = builder.Build();

app.UseStaticFiles();
app.UseRouting();
app.MapControllers();

// Serve the SPA index for any non-API route
app.MapFallbackToFile("index.html");

app.Run();
