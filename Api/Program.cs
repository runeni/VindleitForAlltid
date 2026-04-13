using Api.Data;
using Api.Endpoints;
using Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ── Service defaults (OpenTelemetry, health checks, service discovery) ─────
builder.AddServiceDefaults();

// ── Database ───────────────────────────────────────────────────────────────
builder.AddNpgsqlDbContext<AppDbContext>("db");

// ── CORS (allow frontend dev server) ──────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                builder.Configuration["Frontend:Origin"] ?? "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ── OpenAPI ────────────────────────────────────────────────────────────────
builder.Services.AddOpenApi();

// ── yr.no HTTP client ──────────────────────────────────────────────────────
builder.Services.AddHttpClient<YrForecastClient>(client =>
{
    // yr.no requires a meaningful User-Agent identifying the application
    client.DefaultRequestHeaders.UserAgent.ParseAdd(
        "vindleitforalltid/1.0 github.com/vindleitforalltid");
});

// ── Application services ───────────────────────────────────────────────────
builder.Services.AddScoped<SpotSeeder>();
builder.Services.AddHostedService<ForecastRefreshService>();

var app = builder.Build();

// ── Run migrations and seed on startup ────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    var seeder = scope.ServiceProvider.GetRequiredService<SpotSeeder>();
    await seeder.SeedAsync();
}

// ── Middleware pipeline ────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseHttpsRedirection();
app.MapDefaultEndpoints();

// ── API endpoints ──────────────────────────────────────────────────────────
app.MapSpotEndpoints();
app.MapForecastEndpoints();

app.Run();
