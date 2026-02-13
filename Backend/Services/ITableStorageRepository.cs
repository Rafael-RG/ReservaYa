using Azure;
using Azure.Data.Tables;

namespace ReservaYa.Api.Services;

public interface ITableStorageRepository<T> where T : class, ITableEntity, new()
{
    Task<T?> GetByIdAsync(string partitionKey, string rowKey);
    Task<List<T>> GetAllAsync();
    Task<List<T>> GetByPartitionKeyAsync(string partitionKey);
    Task<T> CreateAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task DeleteAsync(string partitionKey, string rowKey);
}
