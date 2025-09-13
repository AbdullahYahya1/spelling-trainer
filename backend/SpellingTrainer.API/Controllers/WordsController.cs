using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpellingTrainer.API.Data;
using SpellingTrainer.API.Models;
using SpellingTrainer.API.Models.DTOs;
using SpellingTrainer.API.Services;
using System.Security.Claims;

namespace SpellingTrainer.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WordsController : ControllerBase
    {
        private readonly SpellingTrainerContext _context;
        private readonly IJwtService _jwtService;

        public WordsController(SpellingTrainerContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<WordResponse>>> GetWords([FromQuery] string? search = null)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var query = _context.Words.Where(w => w.UserId == userId);

            // Add search functionality
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(w => 
                    w.Text.ToLower().Contains(search) || 
                    (w.Description != null && w.Description.ToLower().Contains(search))
                );
            }

            var words = await query
                .OrderBy(w => w.Text)
                .Select(w => new WordResponse
                {
                    Id = w.Id,
                    Text = w.Text,
                    Description = w.Description,
                    CreatedAt = w.CreatedAt,
                    LastPracticedAt = w.LastPracticedAt,
                    PracticeCount = w.PracticeCount,
                    CorrectCount = w.CorrectCount
                })
                .ToListAsync();

            return Ok(words);
        }

        [HttpPost]
        public async Task<ActionResult<WordResponse>> CreateWord(WordRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            // Validate model state
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Additional validation for spaces
            if (string.IsNullOrWhiteSpace(request.Text) || request.Text.Contains(' '))
            {
                return BadRequest("Word cannot contain spaces or be empty");
            }

            // Check if word already exists for this user
            var existingWord = await _context.Words
                .FirstOrDefaultAsync(w => w.UserId == userId && w.Text.ToLower() == request.Text.ToLower());

            if (existingWord != null)
            {
                return BadRequest("Word already exists");
            }

            var word = new Word
            {
                Text = request.Text,
                Description = request.Description,
                UserId = userId.Value,
                CreatedAt = DateTime.UtcNow
            };

            _context.Words.Add(word);
            await _context.SaveChangesAsync();

            var response = new WordResponse
            {
                Id = word.Id,
                Text = word.Text,
                Description = word.Description,
                CreatedAt = word.CreatedAt,
                LastPracticedAt = word.LastPracticedAt,
                PracticeCount = word.PracticeCount,
                CorrectCount = word.CorrectCount
            };

            return CreatedAtAction(nameof(GetWord), new { id = word.Id }, response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WordResponse>> GetWord(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var word = await _context.Words
                .Where(w => w.Id == id && w.UserId == userId)
                .Select(w => new WordResponse
                {
                    Id = w.Id,
                    Text = w.Text,
                    Description = w.Description,
                    CreatedAt = w.CreatedAt,
                    LastPracticedAt = w.LastPracticedAt,
                    PracticeCount = w.PracticeCount,
                    CorrectCount = w.CorrectCount
                })
                .FirstOrDefaultAsync();

            if (word == null)
            {
                return NotFound();
            }

            return Ok(word);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWord(int id, WordRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            // Validate model state
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Additional validation for spaces
            if (string.IsNullOrWhiteSpace(request.Text) || request.Text.Contains(' '))
            {
                return BadRequest("Word cannot contain spaces or be empty");
            }

            var word = await _context.Words
                .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

            if (word == null)
            {
                return NotFound();
            }

            // Check if new word text already exists for this user
            var existingWord = await _context.Words
                .FirstOrDefaultAsync(w => w.UserId == userId && w.Text.ToLower() == request.Text.ToLower() && w.Id != id);

            if (existingWord != null)
            {
                return BadRequest("Word already exists");
            }

            word.Text = request.Text;
            word.Description = request.Description;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWord(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var word = await _context.Words
                .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

            if (word == null)
            {
                return NotFound();
            }

            _context.Words.Remove(word);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/practice")]
        public async Task<IActionResult> RecordPractice(int id, [FromBody] bool isCorrect)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var word = await _context.Words
                .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

            if (word == null)
            {
                return NotFound();
            }

            word.PracticeCount++;
            if (isCorrect)
            {
                word.CorrectCount++;
            }
            word.LastPracticedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { 
                PracticeCount = word.PracticeCount, 
                CorrectCount = word.CorrectCount,
                Accuracy = word.PracticeCount > 0 ? (double)word.CorrectCount / word.PracticeCount * 100 : 0
            });
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            return null;
        }
    }
}
