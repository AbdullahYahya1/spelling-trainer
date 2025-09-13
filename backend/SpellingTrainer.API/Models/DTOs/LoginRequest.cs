using System.ComponentModel.DataAnnotations;

namespace SpellingTrainer.API.Models.DTOs
{
    public class LoginRequest
    {
        [Required]
        [MaxLength(100)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
    }
}
