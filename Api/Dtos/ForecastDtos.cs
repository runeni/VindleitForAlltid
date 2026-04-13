namespace Api.Dtos;

public record ForecastEntryDto(
    int SpotId,
    string SpotName,
    DateTime Time,
    double WindSpeed,
    double? WindGust,
    double WindFromDirection,
    string? SymbolCode
);

public record SpotForecastDto(
    SpotDto Spot,
    IReadOnlyList<ForecastEntryDto> Entries
);

public record OverviewDayDto(
    DateOnly Date,
    double? BestWindSpeed,
    double? WindFromDirection,
    double? WindGust,
    string? SymbolCode,
    IReadOnlyList<ForecastEntryDto> Hours
);

public record OverviewSpotDto(
    SpotDto Spot,
    IReadOnlyList<OverviewDayDto> Days
);
