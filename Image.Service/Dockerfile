# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /app

# Copy the csproj and restore dependencies
COPY ["Image.Service/Image.Service.csproj", "Image.Service/"]
# THÊM DÒNG NÀY NẾU Image.Service CÓ THAM CHIẾU ĐẾN User.Service
COPY ["User.Service/User.Service.csproj", "User.Service/"] 
# THÊM CÁC DÒNG COPY KHÁC NẾU CÓ THAM CHIẾU ĐẾN CÁC PROJECT KHÁC

RUN dotnet restore "Image.Service/Image.Service.csproj"

# Copy the rest of the application code
COPY . .
WORKDIR /app/Image.Service

# Create wwwroot/images directory for static files (vẫn giữ nguyên)
RUN mkdir -p wwwroot/images

# Publish the application into a *service-specific subfolder*
RUN dotnet publish "Image.Service.csproj" -c Release -o /app/publish/Image.Service /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS final
WORKDIR /app

# Copy the published output from the build stage into its specific subfolder
COPY --from=build /app/publish/Image.Service .

# Expose the default port (80)
EXPOSE 80

# Expose the port for serving static files if needed, though 80 often covers it
# EXPOSE 5004

ENTRYPOINT ["dotnet", "Image.Service.dll"]