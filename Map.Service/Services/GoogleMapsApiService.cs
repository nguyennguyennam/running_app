using Microsoft.Extensions.Options;
using Map.Service.Models;
using System.Text;
using System.Web; // Needed for UrlEncode

namespace Map.Service.Services
{
    public class GoogleMapsApiService
    {
        private readonly GoogleMapsSettings _settings;
        // private readonly IHttpClientFactory _httpClientFactory; // Not strictly needed for static maps, but useful for other Google Maps APIs

        public GoogleMapsApiService(IOptions<GoogleMapsSettings> settings /*, IHttpClientFactory httpClientFactory*/)
        {
            _settings = settings.Value;
            // _httpClientFactory = httpClientFactory;
        }

        public string GenerateStaticMapUrl(List<Coordinate> path)
        {
            if (path == null || !path.Any())
            {
                return string.Empty;
            }

            var pathString = new StringBuilder();
            pathString.Append($"path={_settings.PathColor}");
            foreach (var coord in path)
            {
                pathString.Append($"|{coord.Latitude},{coord.Longitude}");
            }

            // Calculate center of the path for better map view
            var centerLat = path.Average(p => p.Latitude);
            var centerLon = path.Average(p => p.Longitude);

            // For simplicity, a fixed zoom level. In a real app, calculate zoom based on path bounds.
            var zoom = 14;
            var size = "600x400"; // Map image size

            // Ensure all components are URL-encoded
            var encodedPathString = HttpUtility.UrlEncode(pathString.ToString());
            var encodedCenter = HttpUtility.UrlEncode($"{centerLat},{centerLon}");

            return $"{_settings.BaseStaticMapsUrl}?center={encodedCenter}&zoom={zoom}&size={size}&{encodedPathString}&key={_settings.ApiKey}";
        }
    }

    public class GoogleMapsSettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string BaseStaticMapsUrl { get; set; } = string.Empty;
        public string PathColor { get; set; } = string.Empty;
    }
}