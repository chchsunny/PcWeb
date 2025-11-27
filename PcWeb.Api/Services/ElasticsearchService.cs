using Microsoft.EntityFrameworkCore;
using Nest;
using PcWeb.Api.Data;
using PcWeb.Api.Models;

namespace PcWeb.Api.Services
{
    public class ElasticsearchIndexingService : IHostedService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IElasticClient _elasticClient;

        public ElasticsearchIndexingService(
            IServiceProvider serviceProvider,
            IElasticClient elasticClient)
        {
            _serviceProvider = serviceProvider;
            _elasticClient = elasticClient;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            // 建立索引
            var indexExists = await _elasticClient.Indices.ExistsAsync("parts");
            if (!indexExists.Exists)
            {
                await _elasticClient.Indices.CreateAsync("parts", c => c
                    .Map<Part>(m => m.AutoMap())
                );
            }

            // 同步資料
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var parts = await context.Parts.AsNoTracking().ToListAsync();
            
            if (parts.Any())
            {
                await _elasticClient.IndexManyAsync(parts, "parts");
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}