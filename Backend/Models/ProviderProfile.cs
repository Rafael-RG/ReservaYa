using Azure;
using Azure.Data.Tables;

namespace ReservaYa.Api.Models;

public class ProviderProfile : ITableEntity
{
    // Azure Table Storage properties
    public string PartitionKey { get; set; } = string.Empty;
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    // Business properties
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string HeroImage { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ThemeColor { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Instagram { get; set; }
    public string? WorkingHoursJson { get; set; } // Stored as JSON string

    public ProviderProfile()
    {
        // Constructor for Azure Table Storage
    }

    public ProviderProfile(string name, string slug, string description, string heroImage, 
                          string category, string themeColor, string? id = null)
    {
        Id = id ?? Guid.NewGuid().ToString();
        Name = name;
        Slug = slug;
        Description = description;
        HeroImage = heroImage;
        Category = category;
        ThemeColor = themeColor;
        
        // Set Azure Table Storage keys
        PartitionKey = "PROVIDER";
        RowKey = Id;
    }
}
