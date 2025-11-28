using Microsoft.EntityFrameworkCore;
using PcWeb.Api.Data;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// 註冊 DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS 設定
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


// 加入 MVC Controller
builder.Services.AddControllers();

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Redis 連線
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "PcWeb:";
});

// Elasticsearch 設定
var elasticUrl = builder.Configuration["Elasticsearch:Url"] ?? "http://localhost:9200";
var settings = new Nest.ConnectionSettings(new Uri(elasticUrl))
    .DefaultIndex("parts")
    .DefaultMappingFor<PcWeb.Api.Models.Part>(m => m.IndexName("parts"));

builder.Services.AddSingleton<Nest.IElasticClient>(new Nest.ElasticClient(settings));

// 註冊 Elasticsearch 索引服務
builder.Services.AddHostedService<PcWeb.Api.Services.ElasticsearchIndexingService>();

var app = builder.Build();

// 啟動時自動套用 EF Core Migrations
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    try
    {
        // 如果 PcWebDb 是空的，自動建立資料庫
        db.Database.Migrate();
        Console.WriteLine(" Database migration completed.");
    }
    catch (Exception ex)
    {
        Console.WriteLine(" Database migration failed: " + ex.Message);
    }
}

// 開發環境用 Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
