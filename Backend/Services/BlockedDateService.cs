using ReservaYa.Api.Models;

namespace ReservaYa.Api.Services;

public class BlockedDateService : IBlockedDateService
{
    private readonly ITableStorageRepository<BlockedDate> _repository;

    public BlockedDateService(ITableStorageRepository<BlockedDate> repository)
    {
        _repository = repository;
    }

    public async Task<BlockedDate?> GetByIdAsync(string providerId, string id)
    {
        return await _repository.GetByIdAsync(providerId, id);
    }

    public async Task<List<BlockedDate>> GetAllBlockedDatesAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<List<BlockedDate>> GetBlockedDatesByProviderAsync(string providerId)
    {
        return await _repository.GetByPartitionKeyAsync(providerId);
    }

    public async Task<BlockedDate> CreateBlockedDateAsync(BlockedDate blockedDate)
    {
        return await _repository.CreateAsync(blockedDate);
    }

    public async Task<BlockedDate> UpdateBlockedDateAsync(BlockedDate blockedDate)
    {
        return await _repository.UpdateAsync(blockedDate);
    }

    public async Task DeleteBlockedDateAsync(string providerId, string id)
    {
        await _repository.DeleteAsync(providerId, id);
    }
}
