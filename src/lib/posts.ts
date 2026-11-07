import { getCollection, type CollectionEntry } from "astro:content"

export type Post = CollectionEntry<"blog">

/** All posts, newest first. */
export async function getSortedPosts(): Promise<Post[]> {
  const posts = await getCollection("blog")
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export function postPath(post: Post): string {
  return `/${post.id}/`
}

/** e.g. "2020-07-09" */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Plain-text excerpt of the markdown body, truncated on a word boundary. */
export function excerpt(markdown: string, maxLength = 140): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[`*_>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  return cut.slice(0, cut.lastIndexOf(" ")) + "…"
}

export function postDescription(post: Post, maxLength?: number): string {
  return post.data.description ?? excerpt(post.body ?? "", maxLength)
}
