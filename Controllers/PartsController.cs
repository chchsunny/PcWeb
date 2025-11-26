using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Nest;
using PcWeb.Api.Data;
using PcWeb.Api.Models;

namespace PcWeb.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PartsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IDistributedCache _cache;
        private readonly IElasticClient _elasticClient;
        private const string CacheKey = "store:parts:all";

        public PartsController(
            AppDbContext context, 
            IDistributedCache cache,
            IElasticClient elasticClient)
        {
            _context = context;
            _cache = cache;
            _elasticClient = elasticClient;
        }

        // GET: api/parts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Part>>> GetParts()
        {
            var parts = await _context.Parts
                .AsNoTracking()
                .ToListAsync();

            return Ok(parts);
        }

        // GET: api/parts/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Part>> GetPart(int id)
        {
            var part = await _context.Parts.FindAsync(id);

            if (part == null)
            {
                return NotFound();
            }

            return Ok(part);
        }

        // POST: api/parts
        [HttpPost]
        public async Task<ActionResult<Part>> CreatePart([FromBody] Part part)
        {
            // Id 由資料庫自動產生，確保不被前端亂給
            part.Id = 0;

            _context.Parts.Add(part);
            await _context.SaveChangesAsync();

            // 清除快取
            await _cache.RemoveAsync(CacheKey);

            // 新增到 Elasticsearch
            await _elasticClient.IndexDocumentAsync(part);

            // 回傳 201 Created + 新增的資料
            return CreatedAtAction(nameof(GetPart), new { id = part.Id }, part);
        }

        // PUT: api/parts/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdatePart(int id, [FromBody] Part part)
        {
            if (id != part.Id)
            {
                return BadRequest("Id 不一致");
            }

            // 追蹤實體並標記為修改
            _context.Entry(part).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                
                // 清除快取
                await _cache.RemoveAsync(CacheKey);

                // 更新 Elasticsearch
                await _elasticClient.UpdateAsync<Part>(id, u => u.Doc(part));
            }
            catch (DbUpdateConcurrencyException)
            {
                var exists = await _context.Parts.AnyAsync(p => p.Id == id);
                if (!exists)
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/parts/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeletePart(int id)
        {
            var part = await _context.Parts.FindAsync(id);
            if (part == null)
            {
                return NotFound();
            }

            _context.Parts.Remove(part);
            await _context.SaveChangesAsync();

            // 清除快取
            await _cache.RemoveAsync(CacheKey);

            // 從 Elasticsearch 刪除
            await _elasticClient.DeleteAsync<Part>(id);

            return NoContent();
        }
    }
}