namespace Api.Dtos;

public record SpotDto(
    int Id,
    string Identifier,
    string Name,
    double Latitude,
    double Longitude,
    int Altitude,
    bool Active,
    int SortOrder
);

public record CreateSpotRequest(
    string Identifier,
    string Name,
    double Latitude,
    double Longitude,
    int Altitude,
    int SortOrder
);

public record UpdateSpotRequest(
    string Name,
    double Latitude,
    double Longitude,
    int Altitude,
    bool Active,
    int SortOrder
);
