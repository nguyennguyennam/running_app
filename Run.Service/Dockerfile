# Run.Service/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /app



COPY . .
RUN dotnet restore "Run.Service/Run.Service.csproj"
WORKDIR /app/Run.Service

# Publish the application into a *service-specific subfolder*
RUN dotnet publish "Run.Service.csproj" -c Release -o /app/publish/Run.Service /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS final
WORKDIR /app
# Copy the published output from the build stage into its specific subfolder
COPY --from=build /app/publish/Run.Service .

EXPOSE 80

ENTRYPOINT ["dotnet", "Run.Service.dll"]