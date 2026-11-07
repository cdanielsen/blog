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

/** e.g. "July 09, 2020", matching Gatsby's `formatString: "MMMM DD, YYYY"` */
export function formatDate(date: Date): string {
  const month = date.toLocaleString("en-US", { month: "long", timeZone: "UTC" })
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${month} ${day}, ${date.getUTCFullYear()}`
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
