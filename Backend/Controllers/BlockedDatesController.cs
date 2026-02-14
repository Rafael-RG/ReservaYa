using Microsoft.AspNetCore.Mvc;
using ReservaYa.Api.Models;
using ReservaYa.Api.Services;

namespace ReservaYa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlockedDatesController : ControllerBase
{
    private readonly IBlockedDateService _blockedDateService;
    private readonly ILogger<BlockedDatesController> _logger;

    public BlockedDatesController(IBlockedDateService blockedDateService, ILogger<BlockedDatesController> logger)
    {
        _blockedDateService = blockedDateService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<BlockedDate>>> GetAllBlockedDates()
    {
        try
        {
            var blockedDates = await _blockedDateService.GetAllBlockedDatesAsync();
            return Ok(blockedDates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all blocked dates");
            return StatusCode(500, "Error retrieving blocked dates");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BlockedDate>> GetBlockedDate(string id, [FromQuery] string providerId)
    {
        try
        {
            var blockedDate = await _blockedDateService.GetByIdAsync(providerId, id);
            if (blockedDate == null)
            {
                return NotFound();
            }

            return Ok(blockedDate);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting blocked date {BlockedDateId}", id);
            return StatusCode(500, "Error retrieving blocked date");
        }
    }

    [HttpGet("by-provider/{providerId}")]
    public async Task<ActionResult<List<BlockedDate>>> GetBlockedDatesByProvider(string providerId)
    {
        try
        {
            var blockedDates = await _blockedDateService.GetBlockedDatesByProviderAsync(providerId);
            return Ok(blockedDates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting blocked dates for provider {ProviderId}", providerId);
            return StatusCode(500, "Error retrieving blocked dates");
        }
    }

    [HttpPost]
    public async Task<ActionResult<BlockedDate>> CreateBlockedDate([FromBody] CreateBlockedDateRequest request)
    {
        try
        {
            var blockedDate = new BlockedDate(request.ProviderId, request.Date, request.Reason);
            var createdBlockedDate = await _blockedDateService.CreateBlockedDateAsync(blockedDate);
            
            return CreatedAtAction(nameof(GetBlockedDate), 
                new { id = createdBlockedDate.Id, providerId = createdBlockedDate.ProviderId }, 
                createdBlockedDate);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating blocked date");
            return StatusCode(500, "Error creating blocked date");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BlockedDate>> UpdateBlockedDate(string id, [FromBody] BlockedDate blockedDate)
    {
        try
        {
            if (id != blockedDate.Id)
            {
                return BadRequest(ErrorMessages.IdMismatch);
            }

            var updatedBlockedDate = await _blockedDateService.UpdateBlockedDateAsync(blockedDate);
            return Ok(updatedBlockedDate);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating blocked date {BlockedDateId}", id);
            return StatusCode(500, "Error updating blocked date");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteBlockedDate(string id, [FromQuery] string providerId)
    {
        try
        {
            await _blockedDateService.DeleteBlockedDateAsync(providerId, id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting blocked date {BlockedDateId}", id);
            return StatusCode(500, "Error deleting blocked date");
        }
    }
}

public record CreateBlockedDateRequest(
    string ProviderId,
    string Date,
    string? Reason);
