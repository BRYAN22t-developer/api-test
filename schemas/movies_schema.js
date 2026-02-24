import z from "zod";

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: "movie title must be a string"
    }),
    year: z.number().int().min(1900).max(2026),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10),
    poster: z.url(),
    genre: z.array(
      z.enum([
        "Drama",
        "Action",
        "Crime",
        "Adventure",
        "Sci-Fi",
        "Romance",
        "Animation",
        "Biography",
        "Fantasy",
      ]),
    ),
  });

export function validatePartialMovie(object){
    return movieSchema.partial().safeParse(object)
}

export function validateMovie(object){
    return movieSchema.safeParse(object)
}