using Microsoft.EntityFrameworkCore;
using PcWeb.Api.Models;

namespace PcWeb.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
        public DbSet<Part> Parts { get; set; } = null!;
    }
}
