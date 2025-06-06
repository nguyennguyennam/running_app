using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Image.Service.Models; // Vẫn giữ cái này
using User.Service.Models; // Vẫn giữ cái này

namespace Image.Service.Repositories
{
    public class ImageRepository
    {
        private readonly IMongoCollection<Image.Service.Models.Image> _imagesCollection;

        public ImageRepository(IOptions<MongoDbSettings> mongoDbSettings)
        {
            var mongoClient = new MongoClient(mongoDbSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
            _imagesCollection = mongoDatabase.GetCollection<Image.Service.Models.Image>("images");
        }
        
        public async Task<List<Image.Service.Models.Image>> GetAsync() =>
            await _imagesCollection.Find(_ => true).ToListAsync();

        public async Task<Image.Service.Models.Image?> GetByIdAsync(string id) =>
            await _imagesCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<List<Image.Service.Models.Image>> GetByRunActivityIdAsync(string runActivityId) =>
            await _imagesCollection.Find(x => x.RunActivityId == runActivityId).ToListAsync();

        
        public async Task CreateAsync(Image.Service.Models.Image newImage) =>
            await _imagesCollection.InsertOneAsync(newImage);

        public async Task RemoveAsync(string id) =>
            await _imagesCollection.DeleteOneAsync(x => x.Id == id);
    }
}