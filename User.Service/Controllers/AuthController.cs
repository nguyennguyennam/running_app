using Microsoft.AspNetCore.Mvc;
using User.Service.Models; // Giữ lại dòng này vì bạn dùng RegisterRequest và LoginRequest
using User.Service.Repositories;
using User.Service.Services;
using BCrypt.Net; // For password hashing

namespace User.Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserRepository _userRepository;
        private readonly JwtService _jwtService;

        public AuthController(UserRepository userRepository, JwtService jwtService)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _userRepository.GetByUsernameAsync(request.Username) != null)
            {
                return BadRequest(new { message = "Tên đăng nhập đã tồn tại." });
            }

            var newUser = new User.Service.Models.User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };
            await _userRepository.CreateAsync(newUser);
            return Ok(new { message = "Đăng ký thành công." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Sửa ở đây:
            var user = await _userRepository.GetByUsernameAsync(request.Username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng." });
            }

            var token = _jwtService.GenerateToken(user);
            return Ok(new { token, userId = user.Id, username = user.Username });
        }
    }
}