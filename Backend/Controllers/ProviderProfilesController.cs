using Microsoft.AspNetCore.Mvc;
using ReservaYa.Api.Models;
using ReservaYa.Api.Services;

namespace ReservaYa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProviderProfilesController : ControllerBase
{
    private readonly IProviderProfileService _profileService;
    private readonly ILogger<ProviderProfilesController> _logger;

    public ProviderProfilesController(IProviderProfileService profileService, ILogger<ProviderProfilesController> logger)
    {
        _profileService = profileService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProviderProfile>>> GetAllProfiles()
    {
        try
        {
            var profiles = await _profileService.GetAllProfilesAsync();
            return Ok(profiles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all provider profiles");
            return StatusCode(500, "Error retrieving provider profiles");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProviderProfile>> GetProfile(string id)
    {
        try
        {
            var profile = await _profileService.GetByIdAsync(id);
            if (profile == null)
            {
                return NotFound();
            }

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting provider profile {ProfileId}", id);
            return StatusCode(500, "Error retrieving provider profile");
        }
    }

    [HttpGet("by-slug/{slug}")]
    public async Task<ActionResult<ProviderProfile>> GetProfileBySlug(string slug)
    {
        try
        {
            var profile = await _profileService.GetBySlugAsync(slug);
            if (profile == null)
            {
                return NotFound();
            }

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting provider profile by slug {Slug}", slug);
            return StatusCode(500, "Error retrieving provider profile");
        }
    }

    [HttpPost]
    public async Task<ActionResult<ProviderProfile>> CreateProfile([FromBody] CreateProviderProfileRequest request)
    {
        try
        {
            var profile = new ProviderProfile(
                request.Name,
                request.Slug,
                request.Description,
                request.HeroImage,
                request.Category,
                request.ThemeColor)
            {
                Address = request.Address,
                Phone = request.Phone,
                Instagram = request.Instagram,
                WorkingHoursJson = request.WorkingHoursJson
            };

            var createdProfile = await _profileService.CreateProfileAsync(profile);
            return CreatedAtAction(nameof(GetProfile), new { id = createdProfile.Id }, createdProfile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating provider profile");
            return StatusCode(500, "Error creating provider profile");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProviderProfile>> UpdateProfile(string id, [FromBody] ProviderProfile profile)
    {
        try
        {
            if (id != profile.Id)
            {
                return BadRequest(ErrorMessages.IdMismatch);
            }

            var updatedProfile = await _profileService.UpdateProfileAsync(profile);
            return Ok(updatedProfile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating provider profile {ProfileId}", id);
            return StatusCode(500, "Error updating provider profile");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProfile(string id)
    {
        try
        {
            await _profileService.DeleteProfileAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting provider profile {ProfileId}", id);
            return StatusCode(500, "Error deleting provider profile");
        }
    }
}

public record CreateProviderProfileRequest(
    string Name,
    string Slug,
    string Description,
    string HeroImage,
    string Category,
    string ThemeColor,
    string? Address,
    string? Phone,
    string? Instagram,
    string? WorkingHoursJson);
