using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Image.Service.Models
{
    public class Image
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string RunActivityId { get; set; } = string.Empty;

        public string FileName { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty; // Path relative to wwwroot/images, e.g., "/images/myimage.jpg"
        public string Description { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}