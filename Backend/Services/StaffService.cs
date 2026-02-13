using ReservaYa.Api.Models;

namespace ReservaYa.Api.Services;

public class StaffService : IStaffService
{
    private readonly ITableStorageRepository<Staff> _repository;

    public StaffService(ITableStorageRepository<Staff> repository)
    {
        _repository = repository;
    }

    public async Task<Staff?> GetByIdAsync(string providerId, string id)
    {
        return await _repository.GetByIdAsync(providerId, id);
    }

    public async Task<List<Staff>> GetAllStaffAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<List<Staff>> GetStaffByProviderAsync(string providerId)
    {
        return await _repository.GetByPartitionKeyAsync(providerId);
    }

    public async Task<Staff> CreateStaffAsync(Staff staff)
    {
        return await _repository.CreateAsync(staff);
    }

    public async Task<Staff> UpdateStaffAsync(Staff staff)
    {
        return await _repository.UpdateAsync(staff);
    }

    public async Task DeleteStaffAsync(string providerId, string id)
    {
        await _repository.DeleteAsync(providerId, id);
    }
}
