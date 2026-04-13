namespace Api.Domain;

public class ForecastEntry
{
    public int Id { get; set; }
    public int SpotId { get; set; }
    public Spot Spot { get; set; } = null!;

    /// <summary>UTC timestamp of the forecast time step.</summary>
    public DateTime Time { get; set; }

    /// <summary>Wind speed in m/s.</summary>
    public double WindSpeed { get; set; }

    /// <summary>Wind gust speed in m/s.</summary>
    public double? WindGust { get; set; }

    /// <summary>Wind from direction in degrees (0 = north, 90 = east, etc.).</summary>
    public double WindFromDirection { get; set; }

    /// <summary>yr.no symbol code (e.g. "partlycloudy_day").</summary>
    public string? SymbolCode { get; set; }

    /// <summary>When this row was last written from the yr.no response.</summary>
    public DateTime UpdatedAt { get; set; }
}
