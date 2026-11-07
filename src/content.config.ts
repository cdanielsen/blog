import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

const blog = defineCollection({
  // content/blog/<slug>/index.md -> id "<slug>", keeping the Gatsby-era URLs
  loader: glob({
    base: "./content/blog",
    pattern: "*/index.md",
    generateId: ({ entry }) => entry.split("/")[0],
  }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    splashUrl: z.url().optional(),
    splashAuthor: z.string().optional(),
    splashAuthorUrl: z.url().optional(),
  }),
})

export const collections = { blog }
