using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Run.Service.Models;

namespace Run.Service.Repositories
{
    public class RunRepository
    {
        private readonly IMongoCollection<Run.Service.Models.RunActivity> _runsCollection;

        public RunRepository(IOptions<MongoDbSettings> mongoDbSettings)
        {
            var connectionString = mongoDbSettings.Value.ConnectionString;
            var databaseName = mongoDbSettings.Value.DatabaseName;

            Console.WriteLine($"[RunRepository] ConnectionString = {connectionString}");
            Console.WriteLine($"[RunRepository] DatabaseName = {databaseName}");

            var mongoClient = new MongoClient(connectionString);
            var mongoDatabase = mongoClient.GetDatabase(databaseName);

            _runsCollection = mongoDatabase.GetCollection<RunActivity>("runs");
        }


        public async Task<List<RunActivity>> GetAsync() =>
            await _runsCollection.Find(_ => true).ToListAsync();

        public async Task<RunActivity?> GetByIdAsync(string id) =>
            await _runsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<List<RunActivity>> GetByUserIdAsync(string userId) =>
            await _runsCollection.Find(x => x.UserId == userId).ToListAsync();

        public async Task CreateAsync(RunActivity newRun) =>
            await _runsCollection.InsertOneAsync(newRun);

        public async Task UpdateAsync(string id, RunActivity updatedRun) =>
            await _runsCollection.ReplaceOneAsync(x => x.Id == id, updatedRun);

        public async Task RemoveAsync(string id) =>
            await _runsCollection.DeleteOneAsync(x => x.Id == id);
    }
}
