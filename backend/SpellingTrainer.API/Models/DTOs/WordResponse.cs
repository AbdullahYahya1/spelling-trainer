namespace SpellingTrainer.API.Models.DTOs
{
    public class WordResponse
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastPracticedAt { get; set; }
        public int PracticeCount { get; set; }
        public int CorrectCount { get; set; }
    }
}
