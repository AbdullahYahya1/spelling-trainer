using Microsoft.EntityFrameworkCore;
using SpellingTrainer.API.Models;

namespace SpellingTrainer.API.Data
{
    public class SpellingTrainerContext : DbContext
    {
        public SpellingTrainerContext(DbContextOptions<SpellingTrainerContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Word> Words { get; set; }
        public DbSet<Streak> Streaks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Configure Word entity
            modelBuilder.Entity<Word>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Text).IsRequired().HasMaxLength(100);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.PracticeCount).HasDefaultValue(0);
                entity.Property(e => e.CorrectCount).HasDefaultValue(0);
                
                // Configure relationship
                entity.HasOne(e => e.User)
                      .WithMany(e => e.Words)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Streak entity
            modelBuilder.Entity<Streak>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CurrentStreak).HasDefaultValue(0);
                entity.Property(e => e.LongestStreak).HasDefaultValue(0);
                entity.Property(e => e.LastPracticeDate).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                
                // Configure relationship
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
