using Azure;
using Azure.Data.Tables;

namespace ReservaYa.Api.Models;

public class Staff : ITableEntity
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
    public string Role { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;

    public Staff()
    {
        // Constructor for Azure Table Storage
    }

    public Staff(string providerId, string name, string role, string avatar)
    {
        Id = Guid.NewGuid().ToString();
        ProviderId = providerId;
        Name = name;
        Role = role;
        Avatar = avatar;
        
        // Set Azure Table Storage keys - partition by provider
        PartitionKey = providerId;
        RowKey = Id;
    }
}
