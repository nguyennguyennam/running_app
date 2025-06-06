using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Image.Service.Repositories;
using Image.Service.Models; // For MongoDbSettings
using Microsoft.Extensions.FileProviders; // Required for UseStaticFiles
using User.Service.Services; // Reusing JwtSettings for consistency

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.Configure<User.Service.Models.MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddSingleton<ImageRepository>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure JWT Authentication (needs to match User.Service's JWT settings)
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
if (jwtSettings == null || string.IsNullOrEmpty(jwtSettings.Secret))
{
    throw new InvalidOperationException("JWT settings are missing or invalid in appsettings.json for Image.Service. They must match User.Service's settings.");
}
var key = Encoding.ASCII.GetBytes(jwtSettings.Secret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set to true in production
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder.WithOrigins("http://localhost:5173") // Your React frontend URL
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Uncomment in production if using HTTPS

// Enable static file serving from the 'images' folder
var imageStoragePath = app.Configuration.GetValue<string>("ImageStorage:Path");
if (!string.IsNullOrEmpty(imageStoragePath))
{
    // Ensure the physical directory exists when the app starts
    if (!Directory.Exists(imageStoragePath))
    {
        Directory.CreateDirectory(imageStoragePath);
    }

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(imageStoragePath),
        RequestPath = "/images" // This means images will be accessible at http://<Image.Service_URL>/images/<filename>
    });
}


app.UseRouting();
app.UseCors("AllowSpecificOrigin"); // Use CORS policy

app.UseAuthentication(); // Must be before UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();