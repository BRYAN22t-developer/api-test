import express from "express";
import movies from "./movies.json" with { type: "json" };
import crypto from "node:crypto";
import cors from "cors";
import {
  validateMovie,
  validatePartialMovie,
} from "./schemas/movies_schema.js";

const ACEPTED_ORIGINS = ["http://localhost:8080"];

const app = express();
app.disable("x-powered-by");

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        "http://localhost:8080",
        "http://localhost:3000",
      ];

      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      if (!origin) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  }),
);

app.get("/", (req, res) => {
  res.send(movies);
});

app.get("/movies/genres", (req, res) => {
  const genres = movies.flatMap((movie) => movie.genre);
  const uniqueGenres = [...new Set(genres)];
  res.json(uniqueGenres);
});

app.get("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movie = movies.find((movie) => movie.id === id);
  if (movie) return res.json(movie);
  res.status(404).json({ message: "Movie not found" });
});

app.get("/movies", (req, res) => {
  const origin = req.header("origin");
  if (ACEPTED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  const { genre } = req.query;

  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLocaleLowerCase()),
    );
    return res.json(filteredMovies);
  }
  res.json(movies);
});

app.post("/movies", (req, res) => {
  const result = validateMovie(req.body);

  if (result.error) {
    return res.status(422).json({ error: JSON.parse(result.error.message) });
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data,
  };

  movies.push(newMovie);
  res.status(201).json(newMovie);
});

app.delete("/movies/:id", (req, res) => {
  const { id } = req.params;

  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: "Movie not found" });
  }

  movies.splice(movieIndex, 1);

  return res.json({ message: "Movie deleted" });
});

app.patch("/movies/:id", (req, res) => {
  const result = validatePartialMovie(req.body);
  if (!result.success) {
    return res.status(404).json({ error: JSON.parse(result.error.message) });
  }
  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1)
    return res.status(404).json({ message: "Movie not found" });

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data,
  };

  movies[movieIndex] = updateMovie;

  return res.json(updateMovie);
});

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`server listeng on server http://localhost:${PORT}`);
});
