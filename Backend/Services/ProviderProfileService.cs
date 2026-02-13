using ReservaYa.Api.Models;

namespace ReservaYa.Api.Services;

public class ProviderProfileService : IProviderProfileService
{
    private readonly ITableStorageRepository<ProviderProfile> _repository;

    public ProviderProfileService(ITableStorageRepository<ProviderProfile> repository)
    {
        _repository = repository;
    }

    public async Task<ProviderProfile?> GetByIdAsync(string id)
    {
        return await _repository.GetByIdAsync("PROVIDER", id);
    }

    public async Task<ProviderProfile?> GetBySlugAsync(string slug)
    {
        var allProfiles = await _repository.GetAllAsync();
        return allProfiles.FirstOrDefault(p => p.Slug.Equals(slug, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<List<ProviderProfile>> GetAllProfilesAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<ProviderProfile> CreateProfileAsync(ProviderProfile profile)
    {
        return await _repository.CreateAsync(profile);
    }

    public async Task<ProviderProfile> UpdateProfileAsync(ProviderProfile profile)
    {
        return await _repository.UpdateAsync(profile);
    }

    public async Task DeleteProfileAsync(string id)
    {
        await _repository.DeleteAsync("PROVIDER", id);
    }
}
