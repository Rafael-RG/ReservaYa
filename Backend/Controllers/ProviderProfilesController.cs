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
                request.ThemeColor,
                request.Id)
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
    public async Task<ActionResult<ProviderProfile>> UpdateProfile(string id, [FromBody] UpdateProviderProfileRequest request)
    {
        try
        {
            _logger.LogInformation("📝 Actualizando perfil {ProfileId} con datos: Name={Name}, Phone={Phone}, Address={Address}", 
                id, request.Name, request.Phone, request.Address);

            if (id != request.Id)
            {
                return BadRequest(ErrorMessages.IdMismatch);
            }

            // Fetch existing profile first to preserve Azure Table properties
            var existingProfile = await _profileService.GetByIdAsync(id);
            if (existingProfile == null)
            {
                _logger.LogWarning("❌ Perfil {ProfileId} no encontrado", id);
                return NotFound();
            }

            _logger.LogInformation("✅ Perfil existente encontrado: Name={Name}, Phone={Phone}, Address={Address}", 
                existingProfile.Name, existingProfile.Phone, existingProfile.Address);

            // Update only the fields we want to change
            existingProfile.Name = request.Name;
            existingProfile.Description = request.Description ?? existingProfile.Description;
            existingProfile.HeroImage = request.HeroImage ?? existingProfile.HeroImage;
            existingProfile.Category = request.Category ?? existingProfile.Category;
            existingProfile.ThemeColor = request.ThemeColor ?? existingProfile.ThemeColor;
            existingProfile.Address = request.Address;
            existingProfile.Phone = request.Phone;
            existingProfile.Instagram = request.Instagram;
            existingProfile.WorkingHoursJson = request.WorkingHoursJson;

            _logger.LogInformation("💾 Guardando perfil actualizado: Name={Name}, Phone={Phone}, Address={Address}", 
                existingProfile.Name, existingProfile.Phone, existingProfile.Address);

            var updatedProfile = await _profileService.UpdateProfileAsync(existingProfile);
            
            _logger.LogInformation("✅ Perfil {ProfileId} actualizado exitosamente", id);
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
    string? WorkingHoursJson,
    string? Id);

public record UpdateProviderProfileRequest(
    string Id,
    string Name,
    string? Description,
    string? HeroImage,
    string? Category,
    string? ThemeColor,
    string? Address,
    string? Phone,
    string? Instagram,
    string? WorkingHoursJson);
