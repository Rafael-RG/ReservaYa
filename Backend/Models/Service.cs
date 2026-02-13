using Azure;
using Azure.Data.Tables;

namespace ReservaYa.Api.Models;

public class Service : ITableEntity
{
    // Azure Table Storage properties
    public string PartitionKey { get; set; } = string.Empty;
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    // Business properties
    public string Id { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double Price { get; set; }
    public int DurationMinutes { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Image { get; set; }
    public bool RequiresStaffSelection { get; set; }
    public string Type { get; set; } = string.Empty;
    public int? MaxCapacity { get; set; }

    public Service()
    {
        // Constructor for Azure Table Storage
    }

    public Service(string providerId, string name, string description, double price, 
                   int durationMinutes, string category, ServiceType type)
    {
        Id = Guid.NewGuid().ToString();
        ProviderId = providerId;
        Name = name;
        Description = description;
        Price = price;
        DurationMinutes = durationMinutes;
        Category = category;
        Type = type.ToString();
        
        // Set Azure Table Storage keys - partition by provider for efficient queries
        PartitionKey = providerId;
        RowKey = Id;
    }
}
