using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace Run.Service.Models
{
    // Lớp đại diện cho một điểm tọa độ (GPS)
    public class LocationPoint
    {
        public double Latitude { get; set; }
        public double Longtitude { get; set; }
        public string? Name { get; set; }
    }

    // Model lưu dữ liệu chạy
    public class RunActivity
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; } = string.Empty;

        public  int Duration { get; set; }
        public double Distance { get; set; }
        public LocationPoint? StartPoint { get; set; }
        public LocationPoint? EndPoint { get; set; }
        public double CaloriesBurned { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string? RouteGeoJSON { get; set; }

    }

    // MongoDB settings
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
    }
}