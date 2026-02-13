using Microsoft.AspNetCore.Mvc;
using ReservaYa.Api.Models;
using ReservaYa.Api.Services;

namespace ReservaYa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<User>>> GetAllUsers()
    {
        try
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all users");
            return StatusCode(500, "Error retrieving users");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(string id, [FromQuery] string role)
    {
        try
        {
            if (!Enum.TryParse<UserRole>(role, true, out var userRole))
            {
                return BadRequest("Invalid role");
            }

            var user = await _userService.GetByIdAsync(id, userRole);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user {UserId}", id);
            return StatusCode(500, "Error retrieving user");
        }
    }

    [HttpGet("by-email/{email}")]
    public async Task<ActionResult<User>> GetUserByEmail(string email)
    {
        try
        {
            var user = await _userService.GetByEmailAsync(email);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user by email {Email}", email);
            return StatusCode(500, "Error retrieving user");
        }
    }

    [HttpGet("by-role/{role}")]
    public async Task<ActionResult<List<User>>> GetUsersByRole(string role)
    {
        try
        {
            if (!Enum.TryParse<UserRole>(role, true, out var userRole))
            {
                return BadRequest("Invalid role");
            }

            var users = await _userService.GetUsersByRoleAsync(userRole);
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users by role {Role}", role);
            return StatusCode(500, "Error retrieving users");
        }
    }

    [HttpPost]
    public async Task<ActionResult<User>> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            if (!Enum.TryParse<UserRole>(request.Role, true, out var userRole))
            {
                return BadRequest(ErrorMessages.InvalidRole);
            }

            var user = new User(request.Email, request.Name, userRole)
            {
                Avatar = request.Avatar
            };

            var createdUser = await _userService.CreateUserAsync(user);
            return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id, role = createdUser.Role }, createdUser);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, "Error creating user");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<User>> UpdateUser(string id, [FromBody] User user)
    {
        try
        {
            if (id != user.Id)
            {
                return BadRequest(ErrorMessages.IdMismatch);
            }

            var updatedUser = await _userService.UpdateUserAsync(user);
            return Ok(updatedUser);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, "Error updating user");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(string id, [FromQuery] string role)
    {
        try
        {
            if (!Enum.TryParse<UserRole>(role, true, out var userRole))
            {
                return BadRequest("Invalid role");
            }

            await _userService.DeleteUserAsync(id, userRole);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return StatusCode(500, "Error deleting user");
        }
    }
}

public record CreateUserRequest(string Email, string Name, string Role, string? Avatar);
