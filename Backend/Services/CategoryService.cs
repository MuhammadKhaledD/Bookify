using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using static Bookify_Backend.DTOs.CategoryDTO;

namespace Bookify_Backend.Services
{
    public class CategoryService
    {
        private readonly ICategoryRepository _categoryRepo;
        private readonly IUnitOfWork _unitOfWork;

        public CategoryService(ICategoryRepository categoryRepo, IUnitOfWork unitOfWork)
        {
            _categoryRepo = categoryRepo;
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// Get all active categories
        /// </summary>
        public async Task<List<CategoryListDTO>?> GetAllCategoriesAsync()
        {
            try
            {
                var categories = await _categoryRepo.GetAllAsync();
                var activeCategories = categories.Where(c => !c.IsDeleted).ToList();

                return activeCategories.Select(c => new CategoryListDTO
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description
                }).ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Get category by ID
        /// </summary>
        public async Task<CategoryResponseDTO?> GetCategoryByIdAsync(int id)
        {
            try
            {
                if (id <= 0)
                    return null;

                var category = await _categoryRepo.GetByIdAsync(id);

                if (category == null || category.IsDeleted)
                    return null;

                return new CategoryResponseDTO
                {
                    Id = category.Id,
                    Name = category.Name,
                    Description = category.Description,
                    CreatedOn = category.CreatedOn,
                    UpdatedOn = category.UpdatedOn
                };
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Create a new category
        /// </summary>
        public async Task<CategoryResponseDTO?> CreateCategoryAsync(CreateCategoryDTO dto)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return null;

                if (dto.Name.Length > 100)
                    return null;

                // Check for duplicates
                if (await _categoryRepo.NameExistsAsync(dto.Name))
                    return null;

                // Create category
                var category = new Category(dto.Name, dto.Description);

                await _categoryRepo.AddAsync(category);
                await _unitOfWork.SaveChangesAsync();

                return new CategoryResponseDTO
                {
                    Id = category.Id,
                    Name = category.Name,
                    Description = category.Description,
                    CreatedOn = category.CreatedOn,
                    UpdatedOn = category.UpdatedOn
                };
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Update an existing category
        /// </summary>
        public async Task<CategoryResponseDTO?> UpdateCategoryAsync(int id, UpdateCategoryDTO dto)
        {
            try
            {
                if (id <= 0)
                    return null;

                // Get existing category
                var category = await _categoryRepo.GetByIdAsync(id);

                if (category == null || category.IsDeleted)
                    return null;

                // Validate name if provided
                if (!string.IsNullOrWhiteSpace(dto.Name))
                {
                    if (dto.Name.Length > 100)
                        return null;

                    // Check for duplicates only if name is different
                    if (dto.Name != category.Name && await _categoryRepo.NameExistsAsync(dto.Name))
                        return null;
                }

                // Update category
                category.Update(dto.Name, dto.Description);

                await _categoryRepo.UpdateAsync(category);
                await _unitOfWork.SaveChangesAsync();

                return new CategoryResponseDTO
                {
                    Id = category.Id,
                    Name = category.Name,
                    Description = category.Description,
                    CreatedOn = category.CreatedOn,
                    UpdatedOn = category.UpdatedOn
                };
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Delete a category (soft delete)
        /// </summary>
        public async Task<bool> DeleteCategoryAsync(int id)
        {
            try
            {
                if (id <= 0)
                    return false;

                var category = await _categoryRepo.GetByIdAsync(id);

                if (category == null || category.IsDeleted)
                    return false;

                // Soft delete
                category.DeleteCategory();

                await _categoryRepo.UpdateAsync(category);
                await _unitOfWork.SaveChangesAsync();

                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}