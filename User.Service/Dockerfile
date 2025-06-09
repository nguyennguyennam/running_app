# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app


# Copy the rest of the application code
COPY . .
WORKDIR /app/User.Service

# Publish the application into a *service-specific subfolder*
RUN dotnet publish "User.Service.csproj" -c Release -o /app/publish/User.Service /p:UseAppHost=false

# Stage 2: Create the final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copy the published output from the build stage into its specific subfolder
COPY --from=build /app/publish/User.Service . 

# Expose the port that the application will run on
EXPOSE 80 
EXPOSE 443

# Command to run the application
ENTRYPOINT ["dotnet", "User.Service.dll"]