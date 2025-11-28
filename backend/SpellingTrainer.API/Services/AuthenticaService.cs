using System.Text;
using System.Text.Json;

namespace SpellingTrainer.API.Services
{
    public class AuthenticaService : IAuthenticaService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiBaseUrl;
        private readonly string _authToken;

        public AuthenticaService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiBaseUrl = configuration["Authentica:ApiUrl"] ?? "https://api.authentica.sa";
            _authToken = configuration["Authentica:AuthToken"] ?? "your_auth_token_here";
        }

        public async Task<bool> SendOtpAsync(string email, string otp)
        {
            try
            {
                var request = new HttpRequestMessage(HttpMethod.Post, $"{_apiBaseUrl}/api/v2/send-otp");
                request.Headers.Add("X-Authorization", _authToken);
                request.Headers.Add("Accept", "application/json");

                var payload = new
                {
                    method = "email",
                    email = email,
                    otp = otp
                };

                request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(request);
                
                if (!response.IsSuccessStatusCode)
                {
                    // Log error here if needed
                    return false;
                }
                
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> VerifyOtpAsync(string email, string otp)
        {
            try
            {
                var request = new HttpRequestMessage(HttpMethod.Post, $"{_apiBaseUrl}/api/v2/verify-otp");
                request.Headers.Add("X-Authorization", _authToken);
                request.Headers.Add("Accept", "application/json");

                var payload = new
                {
                    email = email,
                    otp = otp
                };

                request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(request);
                
                if (!response.IsSuccessStatusCode)
                {
                    return false;
                }
                
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}

