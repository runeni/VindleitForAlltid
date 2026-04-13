using Aspire.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithPgAdmin();

var db = postgres.AddDatabase("db");

var api = builder.AddProject<Projects.Api>("api")
    .WithReference(db)
    .WaitFor(db);

builder.AddDockerfile("frontend", "../frontend")
    .WithHttpEndpoint(port: 3000, targetPort: 80)
    .WaitFor(api);

builder.Build().Run();
