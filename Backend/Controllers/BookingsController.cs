using Microsoft.AspNetCore.Mvc;
using ReservaYa.Api.Models;
using ReservaYa.Api.Services;

namespace ReservaYa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly ILogger<BookingsController> _logger;

    public BookingsController(IBookingService bookingService, ILogger<BookingsController> logger)
    {
        _bookingService = bookingService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<Booking>>> GetAllBookings()
    {
        try
        {
            var bookings = await _bookingService.GetAllBookingsAsync();
            return Ok(bookings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all bookings");
            return StatusCode(500, "Error retrieving bookings");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Booking>> GetBooking(string id, [FromQuery] string clientId)
    {
        try
        {
            var booking = await _bookingService.GetByIdAsync(clientId, id);
            if (booking == null)
            {
                return NotFound();
            }

            return Ok(booking);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting booking {BookingId}", id);
            return StatusCode(500, "Error retrieving booking");
        }
    }

    [HttpGet("by-client/{clientId}")]
    public async Task<ActionResult<List<Booking>>> GetBookingsByClient(string clientId)
    {
        try
        {
            var bookings = await _bookingService.GetBookingsByClientAsync(clientId);
            return Ok(bookings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting bookings for client {ClientId}", clientId);
            return StatusCode(500, "Error retrieving bookings");
        }
    }

    [HttpGet("by-provider/{providerId}")]
    public async Task<ActionResult<List<Booking>>> GetBookingsByProvider(string providerId)
    {
        try
        {
            var bookings = await _bookingService.GetBookingsByProviderAsync(providerId);
            return Ok(bookings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting bookings for provider {ProviderId}", providerId);
            return StatusCode(500, "Error retrieving bookings");
        }
    }

    [HttpPost]
    public async Task<ActionResult<Booking>> CreateBooking([FromBody] CreateBookingRequest request)
    {
        try
        {
            var booking = new Booking(
                request.ServiceId,
                request.ClientId,
                request.ProviderId,
                request.Date,
                request.Time)
            {
                StaffId = request.StaffId,
                Notes = request.Notes,
                Location = request.Location,
                Guests = request.Guests
            };

            var createdBooking = await _bookingService.CreateBookingAsync(booking);
            return CreatedAtAction(nameof(GetBooking), 
                new { id = createdBooking.Id, clientId = createdBooking.ClientId }, 
                createdBooking);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating booking");
            return StatusCode(500, "Error creating booking");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Booking>> UpdateBooking(string id, [FromBody] Booking booking)
    {
        try
        {
            if (id != booking.Id)
            {
                return BadRequest(ErrorMessages.IdMismatch);
            }

            var updatedBooking = await _bookingService.UpdateBookingAsync(booking);
            return Ok(updatedBooking);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating booking {BookingId}", id);
            return StatusCode(500, "Error updating booking");
        }
    }

    [HttpPatch("{id}/cancel")]
    public async Task<ActionResult<Booking>> CancelBooking(string id, [FromQuery] string clientId)
    {
        try
        {
            var booking = await _bookingService.GetByIdAsync(clientId, id);
            if (booking == null)
            {
                return NotFound();
            }

            booking.Status = BookingStatus.CANCELLED.ToString();
            var updatedBooking = await _bookingService.UpdateBookingAsync(booking);
            return Ok(updatedBooking);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling booking {BookingId}", id);
            return StatusCode(500, "Error cancelling booking");
        }
    }

    [HttpPatch("{id}/confirm")]
    public async Task<ActionResult<Booking>> ConfirmBooking(string id, [FromQuery] string clientId)
    {
        try
        {
            var booking = await _bookingService.GetByIdAsync(clientId, id);
            if (booking == null)
            {
                return NotFound();
            }

            booking.Status = BookingStatus.CONFIRMED.ToString();
            var updatedBooking = await _bookingService.UpdateBookingAsync(booking);
            return Ok(updatedBooking);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming booking {BookingId}", id);
            return StatusCode(500, "Error confirming booking");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteBooking(string id, [FromQuery] string clientId)
    {
        try
        {
            await _bookingService.DeleteBookingAsync(clientId, id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting booking {BookingId}", id);
            return StatusCode(500, "Error deleting booking");
        }
    }
}

public record CreateBookingRequest(
    string ServiceId,
    string ClientId,
    string ProviderId,
    string Date,
    string Time,
    string? StaffId,
    string? Notes,
    string? Location,
    int? Guests);
