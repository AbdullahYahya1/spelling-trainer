namespace SpellingTrainer.API.Models.DTOs
{
    public class StreakResponse
    {
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public DateTime LastPracticeDate { get; set; }
        public bool IsStreakActive { get; set; }
        public int DaysUntilReset { get; set; }
    }
}
