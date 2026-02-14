using Azure;
using Azure.Data.Tables;

namespace ReservaYa.Api.Models;

public class BlockedDate : ITableEntity
{
    // Azure Table Storage properties
    public string PartitionKey { get; set; } = string.Empty;
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    // Business properties
    public string Id { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty; // Formato: YYYY-MM-DD
    public string? Reason { get; set; } // Ej: "Vacaciones", "Feriado", "Día personal"

    public BlockedDate()
    {
        // Constructor for Azure Table Storage
    }

    public BlockedDate(string providerId, string date, string? reason = null)
    {
        Id = Guid.NewGuid().ToString();
        ProviderId = providerId;
        Date = date;
        Reason = reason;
        
        // Set Azure Table Storage keys - partition by provider
        PartitionKey = providerId;
        RowKey = Id;
    }
}
