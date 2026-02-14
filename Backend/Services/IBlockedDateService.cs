using ReservaYa.Api.Models;

namespace ReservaYa.Api.Services;

public interface IBlockedDateService
{
    Task<BlockedDate?> GetByIdAsync(string providerId, string id);
    Task<List<BlockedDate>> GetAllBlockedDatesAsync();
    Task<List<BlockedDate>> GetBlockedDatesByProviderAsync(string providerId);
    Task<BlockedDate> CreateBlockedDateAsync(BlockedDate blockedDate);
    Task<BlockedDate> UpdateBlockedDateAsync(BlockedDate blockedDate);
    Task DeleteBlockedDateAsync(string providerId, string id);
}
