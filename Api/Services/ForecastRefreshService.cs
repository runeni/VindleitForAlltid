using Api.Data;
using Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

/// <summary>
/// Background service that fetches forecasts from yr.no every hour
/// for all active spots and upserts them into the database.
/// </summary>
public class ForecastRefreshService(
    IServiceScopeFactory scopeFactory,
    ILogger<ForecastRefreshService> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("ForecastRefreshService started");

        // Run an immediate refresh on startup, then repeat every hour
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RefreshAllSpotsAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Unhandled error during forecast refresh");
            }

            try
            {
                await Task.Delay(Interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }

        logger.LogInformation("ForecastRefreshService stopped");
    }

    private async Task RefreshAllSpotsAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var yrClient = scope.ServiceProvider.GetRequiredService<YrForecastClient>();

        var spots = await db.Spots.Where(s => s.Active).ToListAsync(ct);
        logger.LogInformation("Refreshing forecasts for {Count} spots", spots.Count);

        foreach (var spot in spots)
        {
            if (ct.IsCancellationRequested) break;
            await RefreshSpotAsync(db, yrClient, spot, ct);
        }
    }

    private async Task RefreshSpotAsync(
        AppDbContext db, YrForecastClient yrClient, Spot spot, CancellationToken ct)
    {
        var forecast = await yrClient.GetForecastAsync(
            spot.Latitude, spot.Longitude, spot.Altitude, ct);

        if (forecast?.Properties?.Timeseries is null)
        {
            logger.LogWarning("No forecast data received for spot {SpotName}", spot.Name);
            return;
        }

        var now = DateTime.UtcNow;

        // Load existing entries for this spot to detect what to upsert
        var existingTimes = await db.ForecastEntries
            .Where(f => f.SpotId == spot.Id)
            .Select(f => f.Time)
            .ToHashSetAsync(ct);

        var toAdd = new List<ForecastEntry>();
        var toUpdate = new List<(DateTime Time, ForecastEntry Entry)>();

        foreach (var ts in forecast.Properties.Timeseries)
        {
            var time = DateTime.SpecifyKind(ts.Time, DateTimeKind.Utc);
            var details = ts.Data?.Instant?.Details;
            if (details is null) continue;

            var windSpeed = details.WindSpeed ?? 0;
            var windGust = details.WindSpeedOfGust;
            var windDir = details.WindFromDirection ?? 0;
            var symbol = ts.Data?.Next1Hours?.Summary?.SymbolCode
                      ?? ts.Data?.Next6Hours?.Summary?.SymbolCode;

            if (existingTimes.Contains(time))
            {
                // Fetch the entry and update it
                var entry = await db.ForecastEntries
                    .FirstAsync(f => f.SpotId == spot.Id && f.Time == time, ct);
                entry.WindSpeed = windSpeed;
                entry.WindGust = windGust;
                entry.WindFromDirection = windDir;
                entry.SymbolCode = symbol;
                entry.UpdatedAt = now;
            }
            else
            {
                toAdd.Add(new ForecastEntry
                {
                    SpotId = spot.Id,
                    Time = time,
                    WindSpeed = windSpeed,
                    WindGust = windGust,
                    WindFromDirection = windDir,
                    SymbolCode = symbol,
                    UpdatedAt = now
                });
            }
        }

        if (toAdd.Count > 0) db.ForecastEntries.AddRange(toAdd);

        // Prune stale entries (older than 1 hour before now)
        var cutoff = now.AddHours(-1);
        var stale = db.ForecastEntries.Where(f => f.SpotId == spot.Id && f.Time < cutoff);
        db.ForecastEntries.RemoveRange(stale);

        await db.SaveChangesAsync(ct);
        logger.LogInformation(
            "Updated forecasts for {SpotName}: +{Added} new entries", spot.Name, toAdd.Count);
    }
}
