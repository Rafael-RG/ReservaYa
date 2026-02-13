using ReservaYa.Api.Models;

namespace ReservaYa.Api.Services;

public interface IBookingService
{
    Task<Booking?> GetByIdAsync(string clientId, string id);
    Task<List<Booking>> GetAllBookingsAsync();
    Task<List<Booking>> GetBookingsByClientAsync(string clientId);
    Task<List<Booking>> GetBookingsByProviderAsync(string providerId);
    Task<Booking> CreateBookingAsync(Booking booking);
    Task<Booking> UpdateBookingAsync(Booking booking);
    Task DeleteBookingAsync(string clientId, string id);
}
