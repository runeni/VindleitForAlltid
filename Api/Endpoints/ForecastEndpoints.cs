using Api.Data;
using Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints;

public static class ForecastEndpoints
{
    public static IEndpointRouteBuilder MapForecastEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/forecasts").WithTags("Forecasts");

        group.MapGet("/", GetOverview);
        group.MapGet("/{spotId:int}", GetSpotForecast);

        return app;
    }

    /// <summary>
    /// Returns the overview: for every active spot, for every day in the next 7 days,
    /// the best wind entry within the requested hour window.
    /// </summary>
    private static async Task<IResult> GetOverview(
        AppDbContext db,
        int fromHour = 8,
        int toHour = 20,
        CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var cutoff = now.AddDays(8);

        var spots = await db.Spots
            .Where(s => s.Active)
            .OrderBy(s => s.SortOrder).ThenBy(s => s.Name)
            .ToListAsync(ct);

        var spotIds = spots.Select(s => s.Id).ToList();

        var entries = await db.ForecastEntries
            .Where(f => spotIds.Contains(f.SpotId)
                     && f.Time >= now
                     && f.Time <= cutoff
                     && f.Time.Hour >= fromHour
                     && f.Time.Hour < toHour)
            .OrderBy(f => f.Time)
            .ToListAsync(ct);

        var result = spots.Select(spot =>
        {
            var spotEntries = entries.Where(e => e.SpotId == spot.Id).ToList();

            // Group by UTC date
            var days = Enumerable.Range(0, 7)
                .Select(i => DateOnly.FromDateTime(now.AddDays(i).Date))
                .Select(date =>
                {
                    var dayEntries = spotEntries
                        .Where(e => DateOnly.FromDateTime(e.Time) == date)
                        .ToList();

                    // Best = highest wind speed for that day
                    var best = dayEntries.MaxBy(e => e.WindSpeed);

                    return new OverviewDayDto(
                        date,
                        best?.WindSpeed,
                        best?.WindFromDirection,
                        best?.WindGust,
                        best?.SymbolCode,
                        dayEntries.Select(e => ToEntryDto(e, spot.Name)).ToList()
                    );
                })
                .ToList();

            var spotDto = new SpotDto(
                spot.Id, spot.Identifier, spot.Name,
                spot.Latitude, spot.Longitude, spot.Altitude, spot.Active, spot.SortOrder);

            return new OverviewSpotDto(spotDto, days);
        }).ToList();

        return Results.Ok(result);
    }

    /// <summary>
    /// Returns all forecast entries for a single spot, filtered by hour window.
    /// </summary>
    private static async Task<IResult> GetSpotForecast(
        int spotId,
        AppDbContext db,
        int fromHour = 8,
        int toHour = 20,
        CancellationToken ct = default)
    {
        var spot = await db.Spots.FindAsync([spotId], ct);
        if (spot is null) return Results.NotFound();

        var now = DateTime.UtcNow;

        var entries = await db.ForecastEntries
            .Where(f => f.SpotId == spotId
                     && f.Time >= now
                     && f.Time.Hour >= fromHour
                     && f.Time.Hour < toHour)
            .OrderBy(f => f.Time)
            .ToListAsync(ct);

        var spotDto = new SpotDto(
            spot.Id, spot.Identifier, spot.Name,
            spot.Latitude, spot.Longitude, spot.Altitude, spot.Active, spot.SortOrder);

        return Results.Ok(new SpotForecastDto(
            spotDto,
            entries.Select(e => ToEntryDto(e, spot.Name)).ToList()
        ));
    }

    private static ForecastEntryDto ToEntryDto(Domain.ForecastEntry e, string spotName) => new(
        e.SpotId, spotName, e.Time, e.WindSpeed, e.WindGust, e.WindFromDirection, e.SymbolCode);
}
