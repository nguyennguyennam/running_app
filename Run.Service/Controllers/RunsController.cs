using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Run.Service.Models;
using Run.Service.Repositories;
using System.Security.Claims;
namespace Run.Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RunsController : ControllerBase
    {
        private readonly RunRepository _runRepository;
        private readonly ILogger<RunsController> _logger;


        public RunsController(RunRepository runRepository, ILogger<RunsController> logger)
        {
            _runRepository = runRepository;
            _logger = logger;
        }

        private string? GetUserIdFromClaims() =>
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value;

        [HttpGet("{userId}")]
        public async Task<ActionResult<List<RunActivity>>> GetMyRuns(String userId)
        {
            var userIdFromToken = GetUserIdFromClaims();
            if (userIdFromToken == null || userIdFromToken != userId)
            {
                return Forbid("Access denied. You can only view your own runs.");
            }

            var runs = await _runRepository.GetByUserIdAsync(userId);
            return Ok(runs ?? new List<RunActivity>());
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] RunActivity request)
        {
            var user = HttpContext.User;
            {
                _logger.LogInformation("🚀 Received request for new run: {@Request}", request); // <--- Add this line
                Console.WriteLine("Incoming request JSON: " + System.Text.Json.JsonSerializer.Serialize(request)); // <--- Add this for raw JSON logging

                foreach (var claim in user.Claims)
                {
                    Console.WriteLine($"{claim.Type}: {claim.Value}");
                }
                var userId = GetUserIdFromClaims();
                if (userId == null) return Unauthorized(new { message = "User ID not found in token." });
                _logger.LogInformation("🟢 Creating run for user {UserId}: {@Request}", userId, request);

                Console.WriteLine("request: " + request);
                var newRun = new RunActivity
                {
                    UserId = userId,
                    Duration = request.Duration,
                    Distance = request.Distance,
                    CaloriesBurned = request.CaloriesBurned,
                    Date = request.Date,
                    StartPoint = request.StartPoint,
                    EndPoint = request.EndPoint,
                    RouteGeoJSON = request.RouteGeoJSON
                };

                await _runRepository.CreateAsync(newRun);
                return CreatedAtAction("Post", new { id = newRun.Id }, newRun);
            }
        }
    }
}
