using System;
using System.Threading.Tasks;
using Bookify_Backend.Services;
using Microsoft.AspNetCore.Mvc;
using static Bookify_Backend.DTOs.CategoryDTO;

namespace Bookify_Backend.Controllers
{
    [ApiController]
    [Route("api/categories")]
    public class CategoriesController : ControllerBase
    {
        private readonly CategoryService _categoryService;

        public CategoriesController(CategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        /// <summary>
        /// GET api/categories
        /// Get all categories
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            try
            {
                var categories = await _categoryService.GetAllCategoriesAsync();

                if (categories == null)
                    return StatusCode(500, new { message = "An error occurred while retrieving categories." });

                return Ok(categories);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// GET api/categories/{id}
        /// Get category by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryByIdAsync(id);

                if (category == null)
                    return NotFound(new { message = "Category not found." });

                return Ok(category);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// POST api/categories
        /// Create a new category
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDTO dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Invalid request data." });

                var category = await _categoryService.CreateCategoryAsync(dto);

                if (category == null)
                    return BadRequest(new { message = "Failed to create category. Name is required and must be unique." });

                return CreatedAtAction(nameof(GetCategoryById), new { id = category.Id }, category);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// PUT api/categories/{id}
        /// Update an existing category
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDTO dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Invalid request data." });

                var category = await _categoryService.UpdateCategoryAsync(id, dto);

                if (category == null)
                    return BadRequest(new { message = "Failed to update category. Category not found or name already exists." });

                return Ok(new { message = "Category updated successfully.", data = category });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// DELETE api/categories/{id}
        /// Delete a category (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var result = await _categoryService.DeleteCategoryAsync(id);

                if (!result)
                    return NotFound(new { message = "Category not found." });

                return Ok(new { message = "Category deleted successfully." });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }
    }
}