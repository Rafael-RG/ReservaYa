using ReservaYa.Api.Models;

namespace ReservaYa.Api.Services;

public interface IStaffService
{
    Task<Staff?> GetByIdAsync(string providerId, string id);
    Task<List<Staff>> GetAllStaffAsync();
    Task<List<Staff>> GetStaffByProviderAsync(string providerId);
    Task<Staff> CreateStaffAsync(Staff staff);
    Task<Staff> UpdateStaffAsync(Staff staff);
    Task DeleteStaffAsync(string providerId, string id);
}
