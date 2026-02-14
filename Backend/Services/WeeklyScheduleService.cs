using ReservaYa.Api.Models;

namespace ReservaYa.Api.Services;

public class WeeklyScheduleService : IWeeklyScheduleService
{
    private readonly ITableStorageRepository<WeeklySchedule> _repository;

    public WeeklyScheduleService(ITableStorageRepository<WeeklySchedule> repository)
    {
        _repository = repository;
    }

    public async Task<WeeklySchedule?> GetByProviderIdAsync(string providerId)
    {
        var schedules = await _repository.GetByPartitionKeyAsync(providerId);
        return schedules.FirstOrDefault();
    }

    public async Task<List<WeeklySchedule>> GetAllSchedulesAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<WeeklySchedule> CreateScheduleAsync(WeeklySchedule schedule)
    {
        return await _repository.CreateAsync(schedule);
    }

    public async Task<WeeklySchedule> UpdateScheduleAsync(WeeklySchedule schedule)
    {
        return await _repository.UpdateAsync(schedule);
    }

    public async Task DeleteScheduleAsync(string providerId, string id)
    {
        await _repository.DeleteAsync(providerId, id);
    }
}
