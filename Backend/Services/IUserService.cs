using ReservaYa.Api.Models;

namespace ReservaYa.Api.Services;

public interface IUserService
{
    Task<User?> GetByIdAsync(string id, UserRole role);
    Task<User?> GetByEmailAsync(string email);
    Task<List<User>> GetAllUsersAsync();
    Task<List<User>> GetUsersByRoleAsync(UserRole role);
    Task<User> CreateUserAsync(User user);
    Task<User> UpdateUserAsync(User user);
    Task DeleteUserAsync(string id, UserRole role);
}
