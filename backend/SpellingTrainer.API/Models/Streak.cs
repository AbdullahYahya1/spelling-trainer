using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SpellingTrainer.API.Models
{
    public class Streak
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User User { get; set; }
        
        [Required]
        public int CurrentStreak { get; set; } = 0;
        
        [Required]
        public int LongestStreak { get; set; } = 0;
        
        [Required]
        public DateTime LastPracticeDate { get; set; } = DateTime.UtcNow;
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
    }
}
