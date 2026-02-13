using ReservaYa.Api.Models;

namespace ReservaYa.Api.Services;

public class ServiceService : IServiceService
{
    private readonly ITableStorageRepository<Service> _repository;

    public ServiceService(ITableStorageRepository<Service> repository)
    {
        _repository = repository;
    }

    public async Task<Service?> GetByIdAsync(string providerId, string id)
    {
        return await _repository.GetByIdAsync(providerId, id);
    }

    public async Task<List<Service>> GetAllServicesAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<List<Service>> GetServicesByProviderAsync(string providerId)
    {
        return await _repository.GetByPartitionKeyAsync(providerId);
    }

    public async Task<Service> CreateServiceAsync(Service service)
    {
        return await _repository.CreateAsync(service);
    }

    public async Task<Service> UpdateServiceAsync(Service service)
    {
        return await _repository.UpdateAsync(service);
    }

    public async Task DeleteServiceAsync(string providerId, string id)
    {
        await _repository.DeleteAsync(providerId, id);
    }
}
