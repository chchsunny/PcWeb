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

        // Parts 這個 DbSet 會對應到資料庫的 Parts 資料表
        public DbSet<Part> Parts { get; set; } = null!;
    }
}
