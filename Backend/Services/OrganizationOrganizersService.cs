using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;

namespace Bookify_Backend.Services
{
    public class OrganizationOrganizersService
    {
        private readonly IOrganizationOrganizerRepository organizationOrganizerRepo;
        private readonly RoleServices _roleServices;
        private readonly IOrganizationRepository orgRepo;
        private readonly IUnitOfWork unitOfWork;

        public OrganizationOrganizersService(IOrganizationOrganizerRepository organizationOrganizerRepo, RoleServices roleServices, IOrganizationRepository orgRepo)
        {
            this.organizationOrganizerRepo = organizationOrganizerRepo;
            this._roleServices = roleServices;
            this.orgRepo = orgRepo;
        }
        public async Task<(IEnumerable<OrganizationOrganizer>?, string?)> GetOrganizerOrganization(string userId)
        {
            try
            {
                if (userId == null)
                    return (null, "Error, user Not Found");
                // check if the user is organizer first 
                var isinrole = await _roleServices.IsUserInRoleAsync(userId, "Organizer");
                if (!isinrole)
                {
                    return (null, "User in Not an organizer");
                }
                var organizerorgs = await organizationOrganizerRepo.GetOrganizationsByUserAsync(userId);
                return (organizerorgs, null);
            }
            catch (Exception ex)
            {

                return (null, ex.Message);
            }
        }

        public async Task<(IEnumerable<OrganizationOrganizer>?, string?)> GetOrganizationOrganizers(int orgId)
        {
            try
            {
                if (orgId == null)
                    return (null, "Error, Please Enter a valid Organization");
                // check if the user is organizer first 
                var org = await orgRepo.GetByIdAsync(orgId);
                if(org == null)
                {
                    return (null, "Organization Not Found");
                }
                var organizerorgs = await organizationOrganizerRepo.GetActiveOrganizersByOrganizationAsync(orgId);
                return (organizerorgs, null);
            }
            catch (Exception ex)
            {

                return (null, ex.Message);
            }
        }
    }
}
