using ReservaYa.Api.Models;

namespace ReservaYa.Api.Services;

public interface IProviderProfileService
{
    Task<ProviderProfile?> GetByIdAsync(string id);
    Task<ProviderProfile?> GetBySlugAsync(string slug);
    Task<List<ProviderProfile>> GetAllProfilesAsync();
    Task<ProviderProfile> CreateProfileAsync(ProviderProfile profile);
    Task<ProviderProfile> UpdateProfileAsync(ProviderProfile profile);
    Task DeleteProfileAsync(string id);
}
