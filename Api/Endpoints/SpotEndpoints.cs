using Api.Data;
using Api.Domain;
using Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints;

public static class SpotEndpoints
{
    public static IEndpointRouteBuilder MapSpotEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/spots").WithTags("Spots");

        group.MapGet("/", GetAllSpots);
        group.MapGet("/{id:int}", GetSpotById);
        group.MapPost("/", CreateSpot);
        group.MapPut("/{id:int}", UpdateSpot);
        group.MapDelete("/{id:int}", DeleteSpot);

        return app;
    }

    private static async Task<IResult> GetAllSpots(AppDbContext db, CancellationToken ct)
    {
        var spots = await db.Spots
            .OrderBy(s => s.SortOrder).ThenBy(s => s.Name)
            .Select(s => ToDto(s))
            .ToListAsync(ct);
        return Results.Ok(spots);
    }

    private static async Task<IResult> GetSpotById(int id, AppDbContext db, CancellationToken ct)
    {
        var spot = await db.Spots.FindAsync([id], ct);
        return spot is null ? Results.NotFound() : Results.Ok(ToDto(spot));
    }

    private static async Task<IResult> CreateSpot(
        [FromBody] CreateSpotRequest req, AppDbContext db, CancellationToken ct)
    {
        if (await db.Spots.AnyAsync(s => s.Identifier == req.Identifier, ct))
            return Results.Conflict($"A spot with identifier '{req.Identifier}' already exists.");

        var spot = new Spot
        {
            Identifier = req.Identifier,
            Name = req.Name,
            Latitude = req.Latitude,
            Longitude = req.Longitude,
            Altitude = req.Altitude,
            SortOrder = req.SortOrder,
            Active = true
        };
        db.Spots.Add(spot);
        await db.SaveChangesAsync(ct);
        return Results.Created($"/api/spots/{spot.Id}", ToDto(spot));
    }

    private static async Task<IResult> UpdateSpot(
        int id, [FromBody] UpdateSpotRequest req, AppDbContext db, CancellationToken ct)
    {
        var spot = await db.Spots.FindAsync([id], ct);
        if (spot is null) return Results.NotFound();

        spot.Name = req.Name;
        spot.Latitude = req.Latitude;
        spot.Longitude = req.Longitude;
        spot.Altitude = req.Altitude;
        spot.Active = req.Active;
        spot.SortOrder = req.SortOrder;

        await db.SaveChangesAsync(ct);
        return Results.Ok(ToDto(spot));
    }

    private static async Task<IResult> DeleteSpot(int id, AppDbContext db, CancellationToken ct)
    {
        var spot = await db.Spots.FindAsync([id], ct);
        if (spot is null) return Results.NotFound();

        spot.Active = false;
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static SpotDto ToDto(Spot s) => new(
        s.Id, s.Identifier, s.Name, s.Latitude, s.Longitude, s.Altitude, s.Active, s.SortOrder);
}
