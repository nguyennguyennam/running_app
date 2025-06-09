using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using User.Service.Repositories;
using User.Service.Services;
using User.Service.Models; 

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.AddSingleton<UserRepository>();
builder.Services.AddSingleton<JwtService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<MongoDbSettings>(options =>
{
    options.ConnectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING") ?? builder.Configuration.GetValue<string>("MongoDbSettings:ConnectionString");
    options.DatabaseName = Environment.GetEnvironmentVariable("MONGO_DATABASE_NAME") ?? builder.Configuration.GetValue<string>("MongoDbSettings:DatabaseName");
});

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
if (jwtSettings == null || string.IsNullOrEmpty(jwtSettings.Secret))
{
    throw new InvalidOperationException("JWT settings are missing or invalid in appsettings.json.");
}
var key = Encoding.ASCII.GetBytes(jwtSettings.Secret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
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
        ClockSkew = TimeSpan.FromMinutes(1)
    };

    // 👇 Add this to send WWW-Authenticate on 401
    options.Events = new JwtBearerEvents
    {
        OnChallenge = context =>
        {
            // This is important to make sure default behavior is suppressed
            context.HandleResponse();

            context.Response.StatusCode = 401;
            context.Response.Headers.Append("WWW-Authenticate", "Bearer");
            return context.Response.WriteAsync("Unauthorized: Missing or invalid token.");
        },
        OnAuthenticationFailed = context =>
        {
            context.Response.StatusCode = 401;
            context.Response.Headers.Append("WWW-Authenticate", "Bearer error=\"invalid_token\"");
            return context.Response.WriteAsync("Authentication failed: Token is invalid or expired.");
        }
    };
});


// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder =>
    {
        builder
            .AllowAnyOrigin() // 👈 Cho phép mọi frontend truy cập (hoặc thay bằng .WithOrigins("http://localhost:3000"))
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithExposedHeaders("WWW-Authenticate"); // 👈 Cho phép browser truy cập header này
    });
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Uncomment in production if using HTTPS

app.UseRouting(); // Important for CORS and Authentication
app.UseCors("AllowAnyOrigin"); // Use CORS policy

app.UseAuthentication(); // Must be before UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();