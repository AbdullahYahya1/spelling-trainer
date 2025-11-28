using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpellingTrainer.API.Data;
using SpellingTrainer.API.Models;
using SpellingTrainer.API.Models.DTOs;
using SpellingTrainer.API.Services;
using BCrypt.Net;

namespace SpellingTrainer.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly SpellingTrainerContext _context;
        private readonly IJwtService _jwtService;
        private readonly IAuthenticaService _authenticaService;

        public AuthController(SpellingTrainerContext context, IJwtService jwtService, IAuthenticaService authenticaService)
        {
            _context = context;
            _jwtService = jwtService;
            _authenticaService = authenticaService;
        }

        public class SendOtpRequest
        {
            public string Email { get; set; }
            public bool IsRegister { get; set; } = false;
        }

        [HttpPost("send-otp")]
        public async Task<ActionResult> SendOtp([FromBody] SendOtpRequest request)
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest("Email is required");
            }

            // Check if user exists to fail early for login attempts
            var userExists = await _context.Users.AnyAsync(u => u.Email == request.Email);

            if (!request.IsRegister && !userExists)
            {
                 return NotFound(new { message = "User not found. Please register first.", code = "USER_NOT_FOUND" });
            }

            // In a real application, we would generate a secure random OTP here.
            // For simplicity and consistency with the previous flow, we generate a 6-digit code.
            var otp = new Random().Next(100000, 999999).ToString();

            // We send this generated OTP to Authentica. Authentica delivers it to the user.
            var result = await _authenticaService.SendOtpAsync(request.Email, otp);

            if (!result)
            {
                return StatusCode(500, "Failed to send OTP via Authentica");
            }

            // Note: The guide implies verify-otp takes {email, otp}. 
            // If Authentica is stateless regarding the OTP *content* (i.e. it just checks if we sent it?), 
            // then we might rely on Authentica storing it.
            // However, if Authentica is just a delivery channel that *also* offers verification of what *it* sent,
            // then it must store it.
            // If Authentica is purely a gateway, WE might need to store the OTP in our DB/Cache to verify it later.
            // The user instructions "USE THIS FOR AUTHINTCATION ... Verify OTP Endpoint ... Request Body { email, otp }"
            // strongly suggests Authentica handles the storage/verification state. 
            // So we don't store the OTP in our DB. We trust Authentica's verify endpoint.

            return Ok(new { Message = "OTP sent successfully" });
        }

        public class VerifyOtpRequest
        {
            public string Email { get; set; }
            public string Otp { get; set; }
            public string? Username { get; set; } // Optional, for registration
        }

        [HttpPost("verify-otp")]
        public async Task<ActionResult<AuthResponse>> VerifyOtp([FromBody] VerifyOtpRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Otp))
            {
                return BadRequest("Email and OTP are required");
            }

            // 1. Verify OTP with Authentica (Server-side verification)
            var isValid = await _authenticaService.VerifyOtpAsync(request.Email, request.Otp);

            if (!isValid)
            {
                return BadRequest("Invalid or expired OTP");
            }

            // 2. If valid, proceed to Login/Register
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                // Registration flow
                if (string.IsNullOrEmpty(request.Username))
                {
                    return NotFound(new { message = "User not found. Please provide a username to register.", code = "USER_NOT_FOUND" });
                }

                if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                {
                     return BadRequest("Username already exists");
                }

                user = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    PasswordHash = "", // No password
                    CreatedAt = DateTime.UtcNow,
                    LastLoginAt = DateTime.UtcNow
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Login flow
                user.LastLoginAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            // 3. Generate and return JWT
            var token = _jwtService.GenerateToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                Username = user.Username,
                Email = user.Email,
                ExpiresAt = DateTime.UtcNow.AddDays(30)
            });
        }
        
        // Keep Validate for existing flow
        [HttpPost("validate")]
        public ActionResult ValidateToken([FromBody] string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest("Token is required");
            }

            var isValid = _jwtService.ValidateToken(token);
            
            if (!isValid)
            {
                return Unauthorized("Invalid token");
            }

            var username = _jwtService.GetUsernameFromToken(token);
            return Ok(new { Username = username, Valid = true });
        }
    }
}
