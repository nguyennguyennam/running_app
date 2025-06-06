using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
// Reusing JwtSettings definition from User.Service for consistency.
// In a large project, this might be in a shared DTOs/Contracts library.
using User.Service.Services;

var builder = WebApplication.CreateBuilder(args);

// Load Ocelot configuration from ocelot.json
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure JWT Authentication for Gateway (to validate tokens before forwarding)
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
if (jwtSettings == null || string.IsNullOrEmpty(jwtSettings.Secret))
{
    throw new InvalidOperationException("JWT settings are missing or invalid in appsettings.json for Gateway.Service. They must match User.Service's settings.");
}
var key = Encoding.ASCII.GetBytes(jwtSettings.Secret);

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer",options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateLifetime = true, // Ensure token lifetime is validated
            ClockSkew = TimeSpan.FromMinutes(10) // Adjust clock skew to match User.Service
        };
    });

builder.Services.AddOcelot();

// Configure CORS for Gateway
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder => builder.AllowAnyOrigin() // Your React frontend URL
                          .AllowAnyHeader()
                          .AllowAnyMethod());
});


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Uncomment in production if using HTTPS

app.UseRouting(); // Important for CORS and Ocelot
app.UseCors("AllowAllOrigins"); // Use CORS policy

app.UseAuthentication(); // Must be before UseOcelot to validate tokens
// app.UseAuthorization(); // If you had specific authorization policies to apply at the gateway level

// Use Ocelot middleware
await app.UseOcelot();

// If you have any Gateway-specific controllers (e.g., /api/gateway/status)
app.MapControllers();

app.Run();