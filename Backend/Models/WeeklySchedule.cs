using Azure;
using Azure.Data.Tables;

namespace ReservaYa.Api.Models;

public class WeeklySchedule : ITableEntity
{
    // Azure Table Storage properties
    public string PartitionKey { get; set; } = string.Empty;
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    // Business properties
    public string Id { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    
    // Días de la semana con horarios (JSON serializado)
    public bool MondayEnabled { get; set; }
    public string? MondayHours { get; set; } // Ej: "09:00-13:00,15:00-19:00"
    
    public bool TuesdayEnabled { get; set; }
    public string? TuesdayHours { get; set; }
    
    public bool WednesdayEnabled { get; set; }
    public string? WednesdayHours { get; set; }
    
    public bool ThursdayEnabled { get; set; }
    public string? ThursdayHours { get; set; }
    
    public bool FridayEnabled { get; set; }
    public string? FridayHours { get; set; }
    
    public bool SaturdayEnabled { get; set; }
    public string? SaturdayHours { get; set; }
    
    public bool SundayEnabled { get; set; }
    public string? SundayHours { get; set; }

    public WeeklySchedule()
    {
        // Constructor for Azure Table Storage
    }

    public WeeklySchedule(string providerId)
    {
        Id = Guid.NewGuid().ToString();
        ProviderId = providerId;
        
        // Set Azure Table Storage keys
        PartitionKey = providerId;
        RowKey = Id;
        
        // Default schedule: Monday to Friday 9:00-18:00
        MondayEnabled = true;
        MondayHours = "09:00-18:00";
        
        TuesdayEnabled = true;
        TuesdayHours = "09:00-18:00";
        
        WednesdayEnabled = true;
        WednesdayHours = "09:00-18:00";
        
        ThursdayEnabled = true;
        ThursdayHours = "09:00-18:00";
        
        FridayEnabled = true;
        FridayHours = "09:00-18:00";
        
        SaturdayEnabled = false;
        SundayEnabled = false;
    }
}
