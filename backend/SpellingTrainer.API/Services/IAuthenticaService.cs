namespace SpellingTrainer.API.Services
{
    public interface IAuthenticaService
    {
        Task<bool> SendOtpAsync(string email, string otp);
        Task<bool> VerifyOtpAsync(string email, string otp);
    }
}

