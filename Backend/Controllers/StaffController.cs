using Microsoft.AspNetCore.Mvc;
using ReservaYa.Api.Models;
using ReservaYa.Api.Services;

namespace ReservaYa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffController : ControllerBase
{
    private readonly IStaffService _staffService;
    private readonly ILogger<StaffController> _logger;

    public StaffController(IStaffService staffService, ILogger<StaffController> logger)
    {
        _staffService = staffService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<Staff>>> GetAllStaff()
    {
        try
        {
            var staff = await _staffService.GetAllStaffAsync();
            return Ok(staff);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all staff");
            return StatusCode(500, "Error retrieving staff");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Staff>> GetStaff(string id, [FromQuery] string providerId)
    {
        try
        {
            var staff = await _staffService.GetByIdAsync(providerId, id);
            if (staff == null)
            {
                return NotFound();
            }

            return Ok(staff);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting staff {StaffId}", id);
            return StatusCode(500, "Error retrieving staff");
        }
    }

    [HttpGet("by-provider/{providerId}")]
    public async Task<ActionResult<List<Staff>>> GetStaffByProvider(string providerId)
    {
        try
        {
            var staff = await _staffService.GetStaffByProviderAsync(providerId);
            return Ok(staff);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting staff for provider {ProviderId}", providerId);
            return StatusCode(500, "Error retrieving staff");
        }
    }

    [HttpPost]
    public async Task<ActionResult<Staff>> CreateStaff([FromBody] CreateStaffRequest request)
    {
        try
        {
            var staff = new Staff(
                request.ProviderId,
                request.Name,
                request.Role,
                request.Avatar);

            var createdStaff = await _staffService.CreateStaffAsync(staff);
            return CreatedAtAction(nameof(GetStaff), 
                new { id = createdStaff.Id, providerId = createdStaff.ProviderId }, 
                createdStaff);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating staff");
            return StatusCode(500, "Error creating staff");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Staff>> UpdateStaff(string id, [FromBody] Staff staff)
    {
        try
        {
            if (id != staff.Id)
            {
                return BadRequest(ErrorMessages.IdMismatch);
            }

            var updatedStaff = await _staffService.UpdateStaffAsync(staff);
            return Ok(updatedStaff);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating staff {StaffId}", id);
            return StatusCode(500, "Error updating staff");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteStaff(string id, [FromQuery] string providerId)
    {
        try
        {
            await _staffService.DeleteStaffAsync(providerId, id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting staff {StaffId}", id);
            return StatusCode(500, "Error deleting staff");
        }
    }
}

public record CreateStaffRequest(string ProviderId, string Name, string Role, string Avatar);
