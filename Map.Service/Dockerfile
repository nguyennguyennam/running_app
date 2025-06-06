# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /app

# Copy the .csproj file and restore dependencies
COPY ["Map.Service/Map.Service.csproj", "Map.Service/"]
COPY ["User.Service/User.Service.csproj", "User.Service/"]

RUN dotnet restore "Map.Service/Map.Service.csproj"

# Copy the rest of the application code
COPY . .
WORKDIR /app/Map.Service

# Publish the application into a *service-specific subfolder*
RUN dotnet publish "Map.Service.csproj" -c Release -o /app/publish/Map.Service /p:UseAppHost=false

# Stage 2: Create the final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS final
WORKDIR /app
# Copy the published output from the build stage from its *service-specific subfolder*
COPY --from=build /app/publish/Map.Service .

# Expose the port that the application will run on (e.g., 5000 or 5001)
# Adjust if your appsettings.json or Program.cs uses a different port
EXPOSE 80 
EXPOSE 443

# Command to run the application
ENTRYPOINT ["dotnet", "Map.Service.dll"]