using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using static Bookify_Backend.DTOs.OrganizationDTO;

namespace Bookify_Backend.Services
{
    public class OrganizationService
    {
        private readonly IOrganizationRepository _orgRepo;
        private readonly IUnitOfWork _unitOfWork;

        public OrganizationService(IOrganizationRepository orgRepo, IUnitOfWork unitOfWork)
        {
            _orgRepo = orgRepo;
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// Get all active organizations
        /// </summary>
        public async Task<List<OrganizationListDTO>?> GetAllOrganizationsAsync()
        {
            try
            {
                var organizations = await _orgRepo.GetAllAsync();
                var activeOrganizations = organizations.Where(o => !o.IsDeleted).ToList();

                return activeOrganizations.Select(o => new OrganizationListDTO
                {
                    Id = o.Id,
                    Name = o.Name,
                    Description = o.Description,
                    ContactEmail = o.ContactEmail
                }).ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Get organization by ID with details
        /// </summary>
        public async Task<OrganizationResponseDTO?> GetOrganizationByIdAsync(int id)
        {
            try
            {
                if (id <= 0)
                    return null;

                var organization = await _orgRepo.GetByIdWithDetailsAsync(id);

                if (organization == null || organization.IsDeleted)
                    return null;

                return new OrganizationResponseDTO
                {
                    Id = organization.Id,
                    Name = organization.Name,
                    Description = organization.Description,
                    ContactEmail = organization.ContactEmail,
                    ContactPhone = organization.ContactPhone,
                    Address = organization.Address,
                    AddedOn = organization.AddedOn,
                    UpdatedOn = organization.UpdatedOn
                };
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Create a new organization
        /// </summary>
        public async Task<OrganizationResponseDTO?> CreateOrganizationAsync(CreateOrganizationDTO dto)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return null;

                if (dto.Name.Length > 255)
                    return null;

                // Validate email format if provided
                if (!string.IsNullOrWhiteSpace(dto.ContactEmail))
                {
                    if (dto.ContactEmail.Length > 255 || !IsValidEmail(dto.ContactEmail))
                        return null;
                }

                // Validate phone if provided
                if (!string.IsNullOrWhiteSpace(dto.ContactPhone))
                {
                    if (dto.ContactPhone.Length > 20)
                        return null;
                }

                // Check for duplicate name
                if (await _orgRepo.NameExistsAsync(dto.Name))
                    return null;

                // Create organization
                var organization = new Organization(
                    dto.Name,
                    dto.Description,
                    dto.ContactEmail,
                    dto.ContactPhone,
                    dto.Address);

                await _orgRepo.AddAsync(organization);
                await _unitOfWork.SaveChangesAsync();

                return new OrganizationResponseDTO
                {
                    Id = organization.Id,
                    Name = organization.Name,
                    Description = organization.Description,
                    ContactEmail = organization.ContactEmail,
                    ContactPhone = organization.ContactPhone,
                    Address = organization.Address,
                    AddedOn = organization.AddedOn,
                    UpdatedOn = organization.UpdatedOn
                };
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Update an existing organization
        /// </summary>
        public async Task<OrganizationResponseDTO?> UpdateOrganizationAsync(int id, UpdateOrganizationDTO dto)
        {
            try
            {
                if (id <= 0)
                    return null;

                // Get existing organization
                var organization = await _orgRepo.GetByIdAsync(id);

                if (organization == null || organization.IsDeleted)
                    return null;

                // Validate name if provided
                if (!string.IsNullOrWhiteSpace(dto.Name))
                {
                    if (dto.Name.Length > 255)
                        return null;

                    // Check for duplicates only if name is different
                    if (dto.Name != organization.Name && await _orgRepo.NameExistsAsync(dto.Name))
                        return null;
                }

                // Validate email if provided
                if (!string.IsNullOrWhiteSpace(dto.ContactEmail))
                {
                    if (dto.ContactEmail.Length > 255 || !IsValidEmail(dto.ContactEmail))
                        return null;
                }

                // Validate phone if provided
                if (!string.IsNullOrWhiteSpace(dto.ContactPhone))
                {
                    if (dto.ContactPhone.Length > 20)
                        return null;
                }

                // Update organization
                organization.Update(
                    dto.Name,
                    dto.Description,
                    dto.ContactEmail,
                    dto.ContactPhone,
                    dto.Address);

                await _orgRepo.UpdateAsync(organization);
                await _unitOfWork.SaveChangesAsync();

                return new OrganizationResponseDTO
                {
                    Id = organization.Id,
                    Name = organization.Name,
                    Description = organization.Description,
                    ContactEmail = organization.ContactEmail,
                    ContactPhone = organization.ContactPhone,
                    Address = organization.Address,
                    AddedOn = organization.AddedOn,
                    UpdatedOn = organization.UpdatedOn
                };
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Delete an organization (soft delete)
        /// </summary>
        public async Task<bool> DeleteOrganizationAsync(int id)
        {
            try
            {
                if (id <= 0)
                    return false;

                var organization = await _orgRepo.GetByIdAsync(id);

                if (organization == null || organization.IsDeleted)
                    return false;

                // Soft delete
                organization.MarkAsDeleted();

                await _orgRepo.UpdateAsync(organization);
                await _unitOfWork.SaveChangesAsync();

                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Simple email validation
        /// </summary>
        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
}