using System.ComponentModel.DataAnnotations;

namespace SpellingTrainer.API.Models.DTOs
{
    public class WordRequest
    {
        [Required]
        [MaxLength(100)]
        [RegularExpression(@"^[^\s]+$", ErrorMessage = "Word cannot contain spaces")]
        public string Text { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
    }
}
