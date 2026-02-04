using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly ReviewService _reviewService;
    private readonly ILogger<ReviewController> _logger;

    public ReviewController(ReviewService reviewService, ILogger<ReviewController> logger)
    {
        _reviewService = reviewService;
        _logger = logger;
    }

    /// <summary>Create a new review</summary>
    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid model state",
                errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
            });
        }

        var result = await _reviewService.CreateReviewAsync(dto);

        if (!result.Success)
        {
            return BadRequest(new { success = false, message = result.Message });
        }

        return Ok(new
        {
            success = true,
            message = result.Message,
            review = result.Review
        });
    }

    /// <summary>Get a review by ID</summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetReviewById(int id)
    {
        var result = await _reviewService.GetReviewByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(new { success = false, message = result.Message });
        }

        return Ok(new
        {
            success = true,
            message = result.Message,
            review = result.Review
        });
    }

    /// <summary>Get all reviews for a specific event</summary>
    [HttpGet("event/{eventId}")]
    public async Task<IActionResult> GetReviewsByEventId(int eventId)
    {
        var result = await _reviewService.GetReviewsByEventIdAsync(eventId);

        if (!result.Success)
        {
            return BadRequest(new { success = false, message = result.Message });
        }

        return Ok(new
        {
            success = true,
            message = result.Message,
            reviews = result.Reviews
        });
    }

    /// <summary>Get all reviews for a specific product</summary>
    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetReviewsByProductId(int productId)
    {
        var result = await _reviewService.GetReviewsByProductIdAsync(productId);

        if (!result.Success)
        {
            return BadRequest(new { success = false, message = result.Message });
        }

        return Ok(new
        {
            success = true,
            message = result.Message,
            reviews = result.Reviews
        });
    }
    
    
    /// <summary>Update a review</summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewDTO dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid model state",
                errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
            });
        }

        var result = await _reviewService.UpdateReviewAsync(id, dto);

        if (!result.Success)
        {
            return BadRequest(new { success = false, message = result.Message });
        }

        return Ok(new { success = true, message = result.Message });
    }

    /// <summary>Delete a review (soft delete)</summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var result = await _reviewService.DeleteReviewAsync(id);

        if (!result.Success)
        {
            return NotFound(new { success = false, message = result.Message });
        }

        return Ok(new { success = true, message = result.Message });
    }
}