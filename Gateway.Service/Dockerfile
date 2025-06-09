# Gateway.Service/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy the csproj and restore dependencies
COPY ["Gateway.Service/Gateway.Service.csproj", "Gateway.Service/"]
RUN dotnet restore "Gateway.Service/Gateway.Service.csproj"

# Copy Ocelot configuration
COPY ["Gateway.Service/ocelot.json", "Gateway.Service/"]

# Copy the rest of the application code
COPY . .
WORKDIR /app/Gateway.Service

# Publish the application
RUN dotnet publish "Gateway.Service.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 80

ENTRYPOINT ["dotnet", "Gateway.Service.dll"]