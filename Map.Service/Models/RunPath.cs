namespace Map.Service.Models
{
    // This model represents a list of coordinates for a run path.
    // In a real application, these coordinates would likely come from GPS tracking.
    // For this example, we'll simulate it or accept it from the client.
    public class RunPath
    {
        public string RunActivityId { get; set; } = string.Empty;
        public List<Coordinate> Path { get; set; } = new List<Coordinate>();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Coordinate
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}