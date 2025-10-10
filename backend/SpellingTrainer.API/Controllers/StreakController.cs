using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpellingTrainer.API.Data;
using SpellingTrainer.API.Models;
using SpellingTrainer.API.Models.DTOs;
using System.Security.Claims;

namespace SpellingTrainer.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StreakController : ControllerBase
    {
        private readonly SpellingTrainerContext _context;

        public StreakController(SpellingTrainerContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<StreakResponse>> GetStreak()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            var streak = await _context.Streaks
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (streak == null)
            {
                // Create new streak for user
                streak = new Streak
                {
                    UserId = userId.Value,
                    CurrentStreak = 0,
                    LongestStreak = 0,
                    LastPracticeDate = DateTime.UtcNow.Date
                };
                _context.Streaks.Add(streak);
                await _context.SaveChangesAsync();
            }

            // Check if streak should be reset (missed a day)
            var today = DateTime.UtcNow.Date;
            var lastPractice = streak.LastPracticeDate.Date;
            var daysDifference = (today - lastPractice).Days;

            if (daysDifference > 1)
            {
                // Streak broken - reset to 0
                streak.CurrentStreak = 0;
                streak.LastPracticeDate = today;
                await _context.SaveChangesAsync();
            }

            var response = new StreakResponse
            {
                CurrentStreak = streak.CurrentStreak,
                LongestStreak = streak.LongestStreak,
                LastPracticeDate = streak.LastPracticeDate,
                IsStreakActive = daysDifference <= 1,
                DaysUntilReset = daysDifference > 1 ? 0 : 1 - daysDifference
            };

            return Ok(response);
        }

        [HttpPut]
        public async Task<ActionResult<StreakResponse>> UpdateStreak()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            var streak = await _context.Streaks
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (streak == null)
            {
                // Create new streak for user
                streak = new Streak
                {
                    UserId = userId.Value,
                    CurrentStreak = 1,
                    LongestStreak = 1,
                    LastPracticeDate = DateTime.UtcNow.Date
                };
                _context.Streaks.Add(streak);
            }
            else
            {
                var today = DateTime.UtcNow.Date;
                var lastPractice = streak.LastPracticeDate.Date;
                var daysDifference = (today - lastPractice).Days;

                if (daysDifference == 0)
                {
                    // Already practiced today
                    return Ok(new StreakResponse
                    {
                        CurrentStreak = streak.CurrentStreak,
                        LongestStreak = streak.LongestStreak,
                        LastPracticeDate = streak.LastPracticeDate,
                        IsStreakActive = true,
                        DaysUntilReset = 1
                    });
                }
                else if (daysDifference == 1)
                {
                    // Consecutive day - increment streak
                    streak.CurrentStreak++;
                    streak.LastPracticeDate = today;
                    
                    // Update longest streak if needed
                    if (streak.CurrentStreak > streak.LongestStreak)
                    {
                        streak.LongestStreak = streak.CurrentStreak;
                    }
                }
                else
                {
                    // Streak broken - reset to 1
                    streak.CurrentStreak = 1;
                    streak.LastPracticeDate = today;
                }
            }

            streak.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var response = new StreakResponse
            {
                CurrentStreak = streak.CurrentStreak,
                LongestStreak = streak.LongestStreak,
                LastPracticeDate = streak.LastPracticeDate,
                IsStreakActive = true,
                DaysUntilReset = 1
            };

            return Ok(response);
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            return null;
        }
    }
}
