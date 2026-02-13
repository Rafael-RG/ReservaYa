using ReservaYa.Api.Models;

namespace ReservaYa.Api.Services;

public class UserService : IUserService
{
    private readonly ITableStorageRepository<User> _repository;

    public UserService(ITableStorageRepository<User> repository)
    {
        _repository = repository;
    }

    public async Task<User?> GetByIdAsync(string id, UserRole role)
    {
        return await _repository.GetByIdAsync(role.ToString(), id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        var allUsers = await _repository.GetAllAsync();
        return allUsers.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<List<User>> GetUsersByRoleAsync(UserRole role)
    {
        return await _repository.GetByPartitionKeyAsync(role.ToString());
    }

    public async Task<User> CreateUserAsync(User user)
    {
        return await _repository.CreateAsync(user);
    }

    public async Task<User> UpdateUserAsync(User user)
    {
        return await _repository.UpdateAsync(user);
    }

    public async Task DeleteUserAsync(string id, UserRole role)
    {
        await _repository.DeleteAsync(role.ToString(), id);
    }
}
