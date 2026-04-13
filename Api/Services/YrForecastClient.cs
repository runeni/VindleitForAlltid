using System.Text.Json;
using System.Text.Json.Serialization;

namespace Api.Services;

/// <summary>Typed client for the yr.no locationforecast/2.0/compact API.</summary>
public class YrForecastClient(HttpClient httpClient, ILogger<YrForecastClient> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<YrForecastResponse?> GetForecastAsync(
        double lat, double lon, int altitude, CancellationToken ct = default)
    {
        var url = $"https://api.met.no/weatherapi/locationforecast/2.0/compact" +
                  $"?lat={lat:F6}&lon={lon:F6}&altitude={altitude}";

        try
        {
            var response = await httpClient.GetAsync(url, ct);
            response.EnsureSuccessStatusCode();
            var stream = await response.Content.ReadAsStreamAsync(ct);
            return await JsonSerializer.DeserializeAsync<YrForecastResponse>(stream, JsonOptions, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to fetch yr.no forecast for lat={Lat} lon={Lon}", lat, lon);
            return null;
        }
    }
}

// ── yr.no compact JSON model ────────────────────────────────────────────────

public record YrForecastResponse(
    [property: JsonPropertyName("properties")] YrProperties Properties
);

public record YrProperties(
    [property: JsonPropertyName("timeseries")] List<YrTimeSeries> Timeseries
);

public record YrTimeSeries(
    [property: JsonPropertyName("time")] DateTime Time,
    [property: JsonPropertyName("data")] YrData Data
);

public record YrData(
    [property: JsonPropertyName("instant")] YrInstant Instant,
    [property: JsonPropertyName("next_1_hours")] YrPeriod? Next1Hours,
    [property: JsonPropertyName("next_6_hours")] YrPeriod? Next6Hours
);

public record YrInstant(
    [property: JsonPropertyName("details")] YrDetails Details
);

public record YrDetails(
    [property: JsonPropertyName("wind_speed")] double? WindSpeed,
    [property: JsonPropertyName("wind_speed_of_gust")] double? WindSpeedOfGust,
    [property: JsonPropertyName("wind_from_direction")] double? WindFromDirection
);

public record YrPeriod(
    [property: JsonPropertyName("summary")] YrSummary? Summary
);

public record YrSummary(
    [property: JsonPropertyName("symbol_code")] string? SymbolCode
);
