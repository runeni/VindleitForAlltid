using Aspire.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithPgAdmin();

var db = postgres.AddDatabase("db");

var api = builder.AddProject<Projects.Api>("api")
    .WithReference(db)
    .WaitFor(db);

builder.Build().Run();
