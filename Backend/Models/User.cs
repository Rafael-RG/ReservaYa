using Azure;
using Azure.Data.Tables;

namespace ReservaYa.Api.Models;

public class User : ITableEntity
{
    // Azure Table Storage properties
    public string PartitionKey { get; set; } = string.Empty;
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    // Business properties
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? Avatar { get; set; }

    public User()
    {
        // Constructor for Azure Table Storage
    }

    public User(string email, string name, UserRole role)
    {
        Id = Guid.NewGuid().ToString();
        Email = email;
        Name = name;
        Role = role.ToString();
        
        // Set Azure Table Storage keys
        PartitionKey = role.ToString();
        RowKey = Id;
    }
}
