using System.ComponentModel.DataAnnotations;

public class CreateReviewDTO
{
    [Required]
    public string UserId { get; set; }
    
    public int? EventId { get; set; }
    
    public int? ProductId { get; set; }
    
    [MaxLength(20)]
    public string? ReviewType { get; set; }
    
    [Required]
    [Range(0, 5, ErrorMessage = "Rating must be between 0 and 5.")]
    public float Rating { get; set; }
    
    public string? Comment { get; set; }
}

public class UpdateReviewDTO
{
    [Required]
    public string UserId { get; set; }
    
    [Range(0, 5, ErrorMessage = "Rating must be between 0 and 5.")]
    public float? Rating { get; set; }
    
    public string? Comment { get; set; }
}
public class ReviewResponesDTO
{
    public int ReviewId { get; set; }
    public string UserId { get; set; }

    public string? UserName { get; set; }

    public int? EventId { get; set; }

    public int? ProductId { get; set; }

    public string? ReviewType { get; set; }
    public float? Rating { get; set; }

    public string? Comment { get; set; }
}

