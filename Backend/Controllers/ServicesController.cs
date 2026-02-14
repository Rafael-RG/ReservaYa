using Microsoft.AspNetCore.Mvc;
using ReservaYa.Api.Models;
using ReservaYa.Api.Services;

namespace ReservaYa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly IServiceService _serviceService;
    private readonly ILogger<ServicesController> _logger;

    public ServicesController(IServiceService serviceService, ILogger<ServicesController> logger)
    {
        _serviceService = serviceService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<Service>>> GetAllServices()
    {
        try
        {
            var services = await _serviceService.GetAllServicesAsync();
            return Ok(services);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all services");
            return StatusCode(500, "Error retrieving services");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Service>> GetService(string id, [FromQuery] string providerId)
    {
        try
        {
            var service = await _serviceService.GetByIdAsync(providerId, id);
            if (service == null)
            {
                return NotFound();
            }

            return Ok(service);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting service {ServiceId}", id);
            return StatusCode(500, "Error retrieving service");
        }
    }

    [HttpGet("by-provider/{providerId}")]
    public async Task<ActionResult<List<Service>>> GetServicesByProvider(string providerId)
    {
        try
        {
            var services = await _serviceService.GetServicesByProviderAsync(providerId);
            return Ok(services);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting services for provider {ProviderId}", providerId);
            return StatusCode(500, "Error retrieving services");
        }
    }

    [HttpPost]
    public async Task<ActionResult<Service>> CreateService([FromBody] CreateServiceRequest request)
    {
        try
        {
            if (!Enum.TryParse<ServiceType>(request.Type, true, out var serviceType))
            {
                return BadRequest(ErrorMessages.InvalidServiceType);
            }

            var service = new Service(
                request.ProviderId,
                request.Name,
                request.Description,
                request.Price,
                request.DurationMinutes,
                request.Category,
                serviceType)
            {
                Image = request.Image,
                RequiresStaffSelection = request.RequiresStaffSelection,
                MaxCapacity = request.MaxCapacity,
                AssignedStaffIds = request.AssignedStaffIds != null && request.AssignedStaffIds.Count > 0 
                    ? string.Join(",", request.AssignedStaffIds) 
                    : null
            };

            var createdService = await _serviceService.CreateServiceAsync(service);
            return CreatedAtAction(nameof(GetService), 
                new { id = createdService.Id, providerId = createdService.ProviderId }, 
                createdService);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating service");
            return StatusCode(500, "Error creating service");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Service>> UpdateService(string id, [FromBody] Service service)
    {
        try
        {
            if (id != service.Id)
            {
                return BadRequest(ErrorMessages.IdMismatch);
            }

            var updatedService = await _serviceService.UpdateServiceAsync(service);
            return Ok(updatedService);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating service {ServiceId}", id);
            return StatusCode(500, "Error updating service");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteService(string id, [FromQuery] string providerId)
    {
        try
        {
            await _serviceService.DeleteServiceAsync(providerId, id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting service {ServiceId}", id);
            return StatusCode(500, "Error deleting service");
        }
    }
}

public record CreateServiceRequest(
    string ProviderId,
    string Name,
    string Description,
    double Price,
    int DurationMinutes,
    string Category,
    string Type,
    string? Image,
    bool RequiresStaffSelection,
    int? MaxCapacity,
    List<string>? AssignedStaffIds);
