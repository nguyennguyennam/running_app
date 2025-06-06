using Microsoft.Extensions.Options;
using MongoDB.Driver;
using User.Service.Models; 

namespace User.Service.Repositories
{
    public class UserRepository
    {
        // Sửa ở đây:
        private readonly IMongoCollection<User.Service.Models.User> _usersCollection;

        public UserRepository(IOptions<MongoDbSettings> mongoDbSettings)
        {
            var mongoClient = new MongoClient(mongoDbSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
            _usersCollection = mongoDatabase.GetCollection<User.Service.Models.User>("users");
        }

        public async Task<List<User.Service.Models.User>> GetAsync() =>
            await _usersCollection.Find(_ => true).ToListAsync();

        public async Task<User.Service.Models.User?> GetByIdAsync(string id) =>
            await _usersCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<User.Service.Models.User?> GetByUsernameAsync(string username) =>
            await _usersCollection.Find(x => x.Username == username).FirstOrDefaultAsync();

        public async Task CreateAsync(User.Service.Models.User newUser) =>
            await _usersCollection.InsertOneAsync(newUser);

        public async Task UpdateAsync(string id, User.Service.Models.User updatedUser) =>
            await _usersCollection.ReplaceOneAsync(x => x.Id == id, updatedUser);

        public async Task RemoveAsync(string id) =>
            await _usersCollection.DeleteOneAsync(x => x.Id == id);
    }
}