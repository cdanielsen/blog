import rss from "@astrojs/rss"
import type { APIContext } from "astro"

import { SITE } from "../consts"
import { excerpt, getSortedPosts, postPath } from "../lib/posts"

export async function GET(context: APIContext) {
  const posts = await getSortedPosts()
  return rss({
    title: `${SITE.title} RSS`,
    description: SITE.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      // the Gatsby feed used the auto excerpt, not the frontmatter description
      description: excerpt(post.body ?? ""),
      pubDate: post.data.date,
      link: postPath(post),
    })),
  })
}
