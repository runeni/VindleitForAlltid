namespace Api.Domain;

public class Spot
{
    public int Id { get; set; }
    public string Identifier { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int Altitude { get; set; }
    public bool Active { get; set; } = true;
    public int SortOrder { get; set; }

    public ICollection<ForecastEntry> ForecastEntries { get; set; } = [];
}
