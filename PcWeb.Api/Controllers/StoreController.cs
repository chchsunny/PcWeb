using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Nest;
using PcWeb.Api.Data;
using PcWeb.Api.Models;
using System.Text.Json;

namespace PcWeb.Api.Controllers
{
    [Route("api/store")]
    [ApiController]
    public class StoreController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IDistributedCache _cache;
        private readonly IElasticClient _elasticClient;

        public StoreController(
            AppDbContext context, 
            IDistributedCache cache,
            IElasticClient elasticClient)
        {
            _context = context;
            _cache = cache;
            _elasticClient = elasticClient;
        }
    

        [HttpGet("parts")]
        public async Task<ActionResult<IEnumerable<Part>>> GetStoreParts()
        {
            const string cacheKey = "store:parts:all";
            
            // 嘗試從快取取得資料
            var cachedData = await _cache.GetStringAsync(cacheKey);
            
            if (!string.IsNullOrEmpty(cachedData))
            {
                var cachedParts = JsonSerializer.Deserialize<List<Part>>(cachedData);
                return Ok(cachedParts);
            }

            // 快取未命中,從資料庫查詢
            var parts = await _context.Parts
                .AsNoTracking()
                .ToListAsync();

            // 儲存到快取 (30分鐘過期)
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30)
            };
            
            await _cache.SetStringAsync(
                cacheKey, 
                JsonSerializer.Serialize(parts), 
                options
            );

            return Ok(parts);
        }


        public class BuildRequest
        {
            public List<int> PartIds { get; set; } = new();
        }

        [HttpPost("build/calculate")]
        public async Task<ActionResult<object>> CalculateBuildPrice(BuildRequest request)
        {
            var parts = await _context.Parts
                .Where(p => request.PartIds.Contains(p.Id))
                .ToListAsync();

            var total = parts.Sum(p => p.Price);

            return Ok(new {
                Total = total,
                Parts = parts
            });
        }


        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Part>>> SearchParts([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
            {
                return BadRequest("搜尋關鍵字不能為空");
            }

            // 使用 Elasticsearch 搜尋
            var searchResponse = await _elasticClient.SearchAsync<Part>(s => s
                .Index("parts")
                .Query(query => query
                    .MultiMatch(m => m
                        .Fields(f => f
                            .Field(p => p.Name)
                            .Field(p => p.Category)
                        )
                        .Query(q)
                        .Fuzziness(Fuzziness.Auto)
                    )
                )
                .Size(100)
            );

            if (!searchResponse.IsValid)
            {
                // Elasticsearch 失敗時降級到資料庫搜尋
                var parts = await _context.Parts
                    .Where(p => p.Name.Contains(q) || p.Category.Contains(q))
                    .ToListAsync();
                return Ok(parts);
            }

            return Ok(searchResponse.Documents);
        }


        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategories()
        {
            var categories = await _context.Parts
                .Select(p => p.Category)
                .Distinct()
                .ToListAsync();

            return Ok(categories);
        }

    }
}