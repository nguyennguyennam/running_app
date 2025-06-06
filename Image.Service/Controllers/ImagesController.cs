using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Image.Service.Models;
using Image.Service.Repositories;
using Microsoft.Extensions.Configuration; // Required for IConfiguration
using Microsoft.AspNetCore.Hosting; // Required for IWebHostEnvironment

namespace Image.Service.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ImagesController : ControllerBase
    {
        private readonly ImageRepository _imageRepository;
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _configuration;

        public ImagesController(ImageRepository imageRepository, IWebHostEnvironment env, IConfiguration configuration)
        {
            _imageRepository = imageRepository;
            _env = env;
            _configuration = configuration;
        }

        // Get the path for image storage from appsettings.json
        private string GetImageStoragePath()
        {
            // Fallback to wwwroot/images if config path is not set
            return _configuration.GetValue<string>("ImageStorage:Path") ?? Path.Combine(_env.WebRootPath, "images");
        }

        [HttpPost("upload/{runActivityId:length(24)}")]
        public async Task<IActionResult> UploadImage(string runActivityId, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded." });
            }

            // TODO: In a real application, you'd verify that 'runActivityId' belongs to the current authenticated user.
            // This might involve calling the Run.Service (via Gateway) or checking claims if runActivityId was in the token.

            var uploadsFolder = GetImageStoragePath();
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var newImage = new Models.Image
            {
                RunActivityId = runActivityId,
                FileName = uniqueFileName,
                ImageUrl = $"/images/{uniqueFileName}", // Path relative to the static files base URL
                Description = $"Image for run {runActivityId}",
                UploadedAt = DateTime.UtcNow
            };

            await _imageRepository.CreateAsync(newImage);

            return Ok(new { message = "Image uploaded successfully!", imageUrl = newImage.ImageUrl, imageId = newImage.Id });
        }

        [HttpGet("run/{runActivityId:length(24)}")]
        public async Task<ActionResult<List<Models.Image>>> GetImagesForRun(string runActivityId)
        {
            // TODO: Verify that 'runActivityId' belongs to the current authenticated user.
            var images = await _imageRepository.GetByRunActivityIdAsync(runActivityId);
            return Ok(images);
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> DeleteImage(string id)
        {
            var image = await _imageRepository.GetByIdAsync(id);
            if (image == null)
            {
                return NotFound();
            }

            // TODO: Verify that the image belongs to the current authenticated user's run.

            // Delete physical file
            var filePath = Path.Combine(GetImageStoragePath(), image.FileName);
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            // Delete record from database
            await _imageRepository.RemoveAsync(id);

            return NoContent();
        }
    }
}