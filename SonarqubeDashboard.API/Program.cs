using SonarqubeDashboard.API.Services;
using System.Net.Http.Headers;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

var sonarBaseUrl = configuration["SonarBaseUrl"];
if (string.IsNullOrEmpty(sonarBaseUrl))
{
    throw new InvalidOperationException("SonarBaseUrl configuration is missing or empty.");
}

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


builder.Services.AddScoped<ProjectService>();
builder.Services.AddScoped<ProjectDetailService>();
builder.Services.AddScoped<ProjectDataService>();

builder.Services.AddHttpClient<MetricsService>(client =>
{
    client.BaseAddress = new Uri($"{sonarBaseUrl}/project_badges/measure");
});

builder.Services.AddHttpClient<SonarqubeMeasuresService>(client =>
{
    client.BaseAddress = new Uri(sonarBaseUrl);
    var username = configuration["SonarUsername"];
    var password = string.Empty;

    var credentials = $"{username}:{password}";
    var bytes = Encoding.UTF8.GetBytes(credentials);
    var base64Credentials = Convert.ToBase64String(bytes);

    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", base64Credentials);
});

builder.Services.AddHttpClient<SonarqubeQualityGateSerivce>(client =>
{
    client.BaseAddress = new Uri(sonarBaseUrl);
    var username = configuration["SonarUsername"];
    var password = string.Empty;

    var credentials = $"{username}:{password}";
    var bytes = Encoding.UTF8.GetBytes(credentials);
    var base64Credentials = Convert.ToBase64String(bytes);

    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", base64Credentials);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
