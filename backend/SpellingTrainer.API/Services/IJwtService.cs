using SpellingTrainer.API.Models;

namespace SpellingTrainer.API.Services
{
    public interface IJwtService
    {
        string GenerateToken(User user);
        bool ValidateToken(string token);
        string GetUsernameFromToken(string token);
    }
}
