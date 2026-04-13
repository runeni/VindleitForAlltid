using Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Spot> Spots => Set<Spot>();
    public DbSet<ForecastEntry> ForecastEntries => Set<ForecastEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Spot>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasIndex(s => s.Identifier).IsUnique();
            e.Property(s => s.Identifier).HasMaxLength(100).IsRequired();
            e.Property(s => s.Name).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<ForecastEntry>(e =>
        {
            e.HasKey(f => f.Id);
            e.HasIndex(f => new { f.SpotId, f.Time }).IsUnique();
            e.Property(f => f.SymbolCode).HasMaxLength(100);
            e.HasOne(f => f.Spot)
             .WithMany(s => s.ForecastEntries)
             .HasForeignKey(f => f.SpotId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
