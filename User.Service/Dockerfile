# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /app

# Copy the .csproj file and restore dependencies
# Docker build context starts at Root Directory (User.Service)
# So User.Service.csproj is directly at the root of the build context.
# We copy it into /app inside the container.
COPY ["User.Service.csproj", "./"] # Sửa đường dẫn này
RUN dotnet restore "User.Service.csproj"

# Copy the rest of the application code
# This copies everything from the Root Directory (User.Service) into /app
COPY . .
# Since the .csproj is now at /app/User.Service.csproj, the WORKDIR should reflect where the build will happen
# WORKDIR /app # Keep working at /app, where User.Service.csproj is

# Publish the application
RUN dotnet publish "User.Service.csproj" -c Release -o /app/publish /p:UseAppHost=false # Đơn giản hóa đường dẫn publish

# Stage 2: Create the final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS final
WORKDIR /app

# Copy the published output from the build stage into its specific subfolder
COPY --from=build /app/publish . # Sửa đường dẫn này, vì đã publish vào /app/publish mà không có User.Service con nữa

# Expose the port that the application will run on
EXPOSE 80 
EXPOSE 443

# Command to run the application
ENTRYPOINT ["dotnet", "User.Service.dll"]