const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];
const likes = [];

function validateRepositoryId(req, res, next) {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(400).json({ error: "Invalid project ID." });
  }
  return next();
}

app.use("/repositories/:id", validateRepositoryId);

app.get("/repositories", (request, response) => {
  const repoWithLikes = repositories.map((repository) => {
    repository.likes = likes.filter(
      (like) => like.repositoryId === repository.id
    ).length;
    return repository;
  });
  return response.json(repoWithLikes);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };
  repositories.push(repository);
  response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id == id
  );
  if (repositoryIndex < 0) {
    return response.status(400).json({ error: "Repository not found." });
  }
  const updateRepo = repositories[repositoryIndex];
  updateRepo.title = title;
  updateRepo.url = url;
  updateRepo.techs = techs;
  repositories[repositoryIndex] = updateRepo;
  response.json(updateRepo);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id
  );
  if (repositoryIndex < 0) {
    return response.status(400).json({ error: "Repository not found." });
  }
  repositories.splice(repositoryIndex, 1);
  return response.status(204).json();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id
  );
  if (repositoryIndex < 0) {
    return response.status(400).json({ error: "Repository not found." });
  }
  likes.push({
    user: uuid(),
    repositoryId: id,
  });
  const likesCount = likes.filter((like) => like.repositoryId === id).length;
  const updatedRepo = repositories[repositoryIndex];
  updatedRepo.likes = likesCount;
  response.json(updatedRepo);
});

module.exports = app;
