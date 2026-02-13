using ReservaYa.Api.Models;

namespace ReservaYa.Api.Services;

public interface IServiceService
{
    Task<Service?> GetByIdAsync(string providerId, string id);
    Task<List<Service>> GetAllServicesAsync();
    Task<List<Service>> GetServicesByProviderAsync(string providerId);
    Task<Service> CreateServiceAsync(Service service);
    Task<Service> UpdateServiceAsync(Service service);
    Task DeleteServiceAsync(string providerId, string id);
}
