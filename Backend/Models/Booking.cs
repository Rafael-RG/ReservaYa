using Azure;
using Azure.Data.Tables;

namespace ReservaYa.Api.Models;

public class Booking : ITableEntity
{
    // Azure Table Storage properties
    public string PartitionKey { get; set; } = string.Empty;
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    // Business properties
    public string Id { get; set; } = string.Empty;
    public string ServiceId { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    public string? StaffId { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? Location { get; set; }
    public int? Guests { get; set; }

    public Booking()
    {
        // Constructor for Azure Table Storage
    }

    public Booking(string serviceId, string clientId, string providerId, 
                   string date, string time)
    {
        Id = Guid.NewGuid().ToString();
        ServiceId = serviceId;
        ClientId = clientId;
        ProviderId = providerId;
        Date = date;
        Time = time;
        Status = BookingStatus.PENDING.ToString();
        
        // Set Azure Table Storage keys - partition by client for efficient client queries
        PartitionKey = clientId;
        RowKey = Id;
    }
}
