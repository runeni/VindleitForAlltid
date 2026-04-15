using System.Text.Json;
using Api.Data;
using Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class SpotSeeder(AppDbContext db, ILogger<SpotSeeder> logger)
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
        // ContentRootPath points at the source directory under Aspire (project dir),
        // but spots.json is copied to the build output. Search both so it works in
        // all environments: Aspire run, dotnet run, and published deployments.
        var candidates = new[]
        {
            Path.Combine(AppContext.BaseDirectory, "spots.json"),
            Path.Combine(Directory.GetCurrentDirectory(), "spots.json"),
        };
        var path = candidates.FirstOrDefault(File.Exists);
        if (path is null)
        {
            logger.LogWarning("spots.json not found in any candidate path — skipping seed. Searched: {Paths}",
                string.Join(", ", candidates));
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
