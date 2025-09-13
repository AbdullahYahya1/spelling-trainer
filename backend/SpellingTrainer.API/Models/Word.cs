using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SpellingTrainer.API.Models
{
    public class Word
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        [RegularExpression(@"^[^\s]+$", ErrorMessage = "Word cannot contain spaces")]
        public string Text { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? LastPracticedAt { get; set; }
        
        public int PracticeCount { get; set; } = 0;
        
        public int CorrectCount { get; set; } = 0;
        
        // Foreign key
        public int UserId { get; set; }
        
        // Navigation property
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}
