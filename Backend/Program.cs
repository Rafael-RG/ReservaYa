using Azure.Data.Tables;
using ReservaYa.Api.Models;
using ReservaYa.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173", 
            "http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// Configure Azure Table Storage
Console.WriteLine($"Environment: {builder.Environment.EnvironmentName}");
var storageConnectionString = builder.Configuration.GetConnectionString("AzureTableStorage") 
    ?? "UseDevelopmentStorage=true";
Console.WriteLine($"Connection String: {(string.IsNullOrEmpty(storageConnectionString) ? "EMPTY!" : "OK - " + storageConnectionString.Substring(0, Math.Min(50, storageConnectionString.Length)))}");

var tableServiceClient = new TableServiceClient(storageConnectionString);
builder.Services.AddSingleton(tableServiceClient);

// Register repositories
builder.Services.AddScoped<ITableStorageRepository<User>>(sp =>
    new TableStorageRepository<User>(sp.GetRequiredService<TableServiceClient>(), "Users"));

builder.Services.AddScoped<ITableStorageRepository<Service>>(sp =>
    new TableStorageRepository<Service>(sp.GetRequiredService<TableServiceClient>(), "Services"));

builder.Services.AddScoped<ITableStorageRepository<Booking>>(sp =>
    new TableStorageRepository<Booking>(sp.GetRequiredService<TableServiceClient>(), "Bookings"));

builder.Services.AddScoped<ITableStorageRepository<Staff>>(sp =>
    new TableStorageRepository<Staff>(sp.GetRequiredService<TableServiceClient>(), "Staff"));

builder.Services.AddScoped<ITableStorageRepository<ProviderProfile>>(sp =>
    new TableStorageRepository<ProviderProfile>(sp.GetRequiredService<TableServiceClient>(), "ProviderProfiles"));

builder.Services.AddScoped<ITableStorageRepository<WeeklySchedule>>(sp =>
    new TableStorageRepository<WeeklySchedule>(sp.GetRequiredService<TableServiceClient>(), "WeeklySchedules"));

builder.Services.AddScoped<ITableStorageRepository<BlockedDate>>(sp =>
    new TableStorageRepository<BlockedDate>(sp.GetRequiredService<TableServiceClient>(), "BlockedDates"));

// Register business services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IServiceService, ServiceService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddScoped<IProviderProfileService, ProviderProfileService>();
builder.Services.AddScoped<IWeeklyScheduleService, WeeklyScheduleService>();
builder.Services.AddScoped<IBlockedDateService, BlockedDateService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

await app.RunAsync();
