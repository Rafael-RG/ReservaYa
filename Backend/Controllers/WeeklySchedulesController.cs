using Microsoft.AspNetCore.Mvc;
using ReservaYa.Api.Models;
using ReservaYa.Api.Services;

namespace ReservaYa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WeeklySchedulesController : ControllerBase
{
    private readonly IWeeklyScheduleService _scheduleService;
    private readonly ILogger<WeeklySchedulesController> _logger;

    public WeeklySchedulesController(IWeeklyScheduleService scheduleService, ILogger<WeeklySchedulesController> logger)
    {
        _scheduleService = scheduleService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<WeeklySchedule>>> GetAllSchedules()
    {
        try
        {
            var schedules = await _scheduleService.GetAllSchedulesAsync();
            return Ok(schedules);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all schedules");
            return StatusCode(500, "Error retrieving schedules");
        }
    }

    [HttpGet("by-provider/{providerId}")]
    public async Task<ActionResult<WeeklySchedule>> GetScheduleByProvider(string providerId)
    {
        try
        {
            var schedule = await _scheduleService.GetByProviderIdAsync(providerId);
            if (schedule == null)
            {
                return NotFound();
            }

            return Ok(schedule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting schedule for provider {ProviderId}", providerId);
            return StatusCode(500, "Error retrieving schedule");
        }
    }

    [HttpPost]
    public async Task<ActionResult<WeeklySchedule>> CreateSchedule([FromBody] CreateScheduleRequest request)
    {
        try
        {
            var schedule = new WeeklySchedule(request.ProviderId)
            {
                MondayEnabled = request.MondayEnabled,
                MondayHours = request.MondayHours,
                TuesdayEnabled = request.TuesdayEnabled,
                TuesdayHours = request.TuesdayHours,
                WednesdayEnabled = request.WednesdayEnabled,
                WednesdayHours = request.WednesdayHours,
                ThursdayEnabled = request.ThursdayEnabled,
                ThursdayHours = request.ThursdayHours,
                FridayEnabled = request.FridayEnabled,
                FridayHours = request.FridayHours,
                SaturdayEnabled = request.SaturdayEnabled,
                SaturdayHours = request.SaturdayHours,
                SundayEnabled = request.SundayEnabled,
                SundayHours = request.SundayHours
            };

            var createdSchedule = await _scheduleService.CreateScheduleAsync(schedule);
            return CreatedAtAction(nameof(GetScheduleByProvider), 
                new { providerId = createdSchedule.ProviderId }, 
                createdSchedule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating schedule");
            return StatusCode(500, "Error creating schedule");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<WeeklySchedule>> UpdateSchedule(string id, [FromBody] WeeklySchedule schedule)
    {
        try
        {
            if (id != schedule.Id)
            {
                return BadRequest(ErrorMessages.IdMismatch);
            }

            var updatedSchedule = await _scheduleService.UpdateScheduleAsync(schedule);
            return Ok(updatedSchedule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating schedule {ScheduleId}", id);
            return StatusCode(500, "Error updating schedule");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteSchedule(string id, [FromQuery] string providerId)
    {
        try
        {
            await _scheduleService.DeleteScheduleAsync(providerId, id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting schedule {ScheduleId}", id);
            return StatusCode(500, "Error deleting schedule");
        }
    }
}

public record CreateScheduleRequest(
    string ProviderId,
    bool MondayEnabled,
    string? MondayHours,
    bool TuesdayEnabled,
    string? TuesdayHours,
    bool WednesdayEnabled,
    string? WednesdayHours,
    bool ThursdayEnabled,
    string? ThursdayHours,
    bool FridayEnabled,
    string? FridayHours,
    bool SaturdayEnabled,
    string? SaturdayHours,
    bool SundayEnabled,
    string? SundayHours);
