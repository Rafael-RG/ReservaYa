using ReservaYa.Api.Models;

namespace ReservaYa.Api.Services;

public interface IWeeklyScheduleService
{
    Task<WeeklySchedule?> GetByProviderIdAsync(string providerId);
    Task<List<WeeklySchedule>> GetAllSchedulesAsync();
    Task<WeeklySchedule> CreateScheduleAsync(WeeklySchedule schedule);
    Task<WeeklySchedule> UpdateScheduleAsync(WeeklySchedule schedule);
    Task DeleteScheduleAsync(string providerId, string id);
}
