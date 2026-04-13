using System.Text.Json;
using Api.Data;
using Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class SpotSeeder(AppDbContext db, IWebHostEnvironment env, ILogger<SpotSeeder> logger)
{
    private record SpotJson(
        string Identifier,
        string Name,
        double Latitude,
        double Longitude,
        int Altitude,
        bool Active,
        int SortOrder
    );

    public async Task SeedAsync(CancellationToken ct = default)
    {
        var path = Path.Combine(env.ContentRootPath, "spots.json");
        if (!File.Exists(path))
        {
            logger.LogWarning("spots.json not found at {Path} — skipping seed", path);
            return;
        }

        await using var stream = File.OpenRead(path);
        var spots = await JsonSerializer.DeserializeAsync<List<SpotJson>>(stream,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }, ct);

        if (spots is null or { Count: 0 })
        {
            logger.LogWarning("spots.json is empty — nothing to seed");
            return;
        }

        foreach (var s in spots)
        {
            var existing = await db.Spots
                .FirstOrDefaultAsync(x => x.Identifier == s.Identifier, ct);

            if (existing is null)
            {
                db.Spots.Add(new Spot
                {
                    Identifier = s.Identifier,
                    Name = s.Name,
                    Latitude = s.Latitude,
                    Longitude = s.Longitude,
                    Altitude = s.Altitude,
                    Active = s.Active,
                    SortOrder = s.SortOrder
                });
                logger.LogInformation("Seeding new spot: {Name}", s.Name);
            }
            else
            {
                // Update mutable fields but preserve admin changes to Active/SortOrder
                existing.Name = s.Name;
                existing.Latitude = s.Latitude;
                existing.Longitude = s.Longitude;
                existing.Altitude = s.Altitude;
            }
        }

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Spot seed complete. {Count} spots in file.", spots.Count);
    }
}
