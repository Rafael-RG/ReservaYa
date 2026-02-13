using ReservaYa.Api.Models;

namespace ReservaYa.Api.Services;

public class BookingService : IBookingService
{
    private readonly ITableStorageRepository<Booking> _repository;

    public BookingService(ITableStorageRepository<Booking> repository)
    {
        _repository = repository;
    }

    public async Task<Booking?> GetByIdAsync(string clientId, string id)
    {
        return await _repository.GetByIdAsync(clientId, id);
    }

    public async Task<List<Booking>> GetAllBookingsAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<List<Booking>> GetBookingsByClientAsync(string clientId)
    {
        return await _repository.GetByPartitionKeyAsync(clientId);
    }

    public async Task<List<Booking>> GetBookingsByProviderAsync(string providerId)
    {
        var allBookings = await _repository.GetAllAsync();
        return allBookings.Where(b => b.ProviderId == providerId).ToList();
    }

    public async Task<Booking> CreateBookingAsync(Booking booking)
    {
        return await _repository.CreateAsync(booking);
    }

    public async Task<Booking> UpdateBookingAsync(Booking booking)
    {
        return await _repository.UpdateAsync(booking);
    }

    public async Task DeleteBookingAsync(string clientId, string id)
    {
        await _repository.DeleteAsync(clientId, id);
    }
}
