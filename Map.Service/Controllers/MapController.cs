using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Map.Service.Models;
using Map.Service.Services;
using System.Collections.Concurrent; // Used for in-memory storage for this example

namespace Map.Service.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class MapController : ControllerBase
    {
        private readonly GoogleMapsApiService _googleMapsApiService;
        // Using ConcurrentDictionary for in-memory temporary storage of run paths.
        // In a production environment, you would store this data persistently in a database (e.g., MongoDB, Redis).
        private static readonly ConcurrentDictionary<string, RunPath> _runPaths = new ConcurrentDictionary<string, RunPath>();


        public MapController(GoogleMapsApiService googleMapsApiService)
        {
            _googleMapsApiService = googleMapsApiService;
        }

        // This endpoint would receive real-time or recorded GPS coordinates for a run.
        [HttpPost("track/{runActivityId:length(24)}")]
        public IActionResult TrackRun(string runActivityId, [FromBody] List<Coordinate> coordinates)
        {
            if (coordinates == null || !coordinates.Any())
            {
                return BadRequest(new { message = "No coordinates provided." });
            }

            // TODO: In a real app, verify 'runActivityId' belongs to the current user.
            // For simplicity, we're just storing it.

            var runPath = new RunPath
            {
                RunActivityId = runActivityId,
                Path = coordinates,
                CreatedAt = DateTime.UtcNow
            };
            _runPaths.AddOrUpdate(runActivityId, runPath, (key, existingVal) => runPath); // Add or update the path

            return Ok(new { message = $"Run path saved for run {runActivityId}" });
        }

        [HttpGet("static-map/{runActivityId:length(24)}")]
        public IActionResult GetStaticMap(string runActivityId)
        {
            if (!_runPaths.TryGetValue(runActivityId, out var runPath) || !runPath.Path.Any())
            {
                return NotFound(new { message = "No run path data found for this ID. Please track a run first." });
            }

            var imageUrl = _googleMapsApiService.GenerateStaticMapUrl(runPath.Path);
            if (string.IsNullOrEmpty(imageUrl))
            {
                return StatusCode(500, new { message = "Could not generate static map URL. Check API Key and path data." });
            }

            return Ok(new { imageUrl });
        }
    }
}