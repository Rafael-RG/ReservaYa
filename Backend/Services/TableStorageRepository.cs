using Azure;
using Azure.Data.Tables;

namespace ReservaYa.Api.Services;

public class TableStorageRepository<T> : ITableStorageRepository<T> where T : class, ITableEntity, new()
{
    private readonly TableClient _tableClient;

    public TableStorageRepository(TableServiceClient tableServiceClient, string tableName)
    {
        _tableClient = tableServiceClient.GetTableClient(tableName);
        _tableClient.CreateIfNotExists();
    }

    public async Task<T?> GetByIdAsync(string partitionKey, string rowKey)
    {
        try
        {
            var response = await _tableClient.GetEntityAsync<T>(partitionKey, rowKey);
            return response.Value;
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            return null;
        }
    }

    public async Task<List<T>> GetAllAsync()
    {
        var entities = new List<T>();
        await foreach (var entity in _tableClient.QueryAsync<T>())
        {
            entities.Add(entity);
        }
        return entities;
    }

    public async Task<List<T>> GetByPartitionKeyAsync(string partitionKey)
    {
        var entities = new List<T>();
        var filter = $"PartitionKey eq '{partitionKey}'";
        
        await foreach (var entity in _tableClient.QueryAsync<T>(filter))
        {
            entities.Add(entity);
        }
        return entities;
    }

    public async Task<T> CreateAsync(T entity)
    {
        await _tableClient.AddEntityAsync(entity);
        return entity;
    }

    public async Task<T> UpdateAsync(T entity)
    {
        // Use ETag.All (*) to update regardless of ETag conflicts
        // This is safe for our single-user scenario
        await _tableClient.UpdateEntityAsync(entity, ETag.All, TableUpdateMode.Replace);
        return entity;
    }

    public async Task DeleteAsync(string partitionKey, string rowKey)
    {
        await _tableClient.DeleteEntityAsync(partitionKey, rowKey);
    }
}
