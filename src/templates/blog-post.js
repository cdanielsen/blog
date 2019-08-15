import React from "react"
import PropTypes from "prop-types"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm, scale } from "../utils/typography"
import headshot from "../../content/assets/headshot.png"

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    const siteTitle = this.props.data.site.siteMetadata.title
    const { previous, next } = this.props.pageContext
    const { location } = this.props
    const splashUrl = post.frontmatter.splashUrl || null
    const splashAuthor = post.frontmatter.splashAuthor || null
    const splashAuthorUrl = post.frontmatter.splashAuthorUrl || null

    return (
      <Layout location={location} title={siteTitle}>
        <SEO
          title={post.frontmatter.title}
          description={post.frontmatter.description || post.excerpt}
        />
        {splashUrl && (
          <img
            src={post.frontmatter.splashUrl}
            style={{
              marginBottom: 0,
            }}
          />
        )}
        {splashAuthor && (
          <p
            style={{
              textAlign: `center`,
              fontSize: `0.5rem`,
            }}
          >
            Photo by{" "}
            <a href={splashAuthorUrl} target="_blank" rel="noopener noreferrer">
              {splashAuthor}
            </a>
          </p>
        )}
        <div>
          <h2>{post.frontmatter.title}</h2>
          <p
            style={{
              ...scale(-1 / 5),
              display: `flex`,
              flexDirection: `row`,
              justifyContent: `flex-start`,
              alignItems: `center`,
              marginBottom: rhythm(1),
              marginTop: rhythm(-0.5),
            }}
          >
            <span
              style={{
                marginRight: `5px`,
              }}
            >
              {post.frontmatter.date} by {post.frontmatter.author}
            </span>
            <img
              src={headshot}
              alt={`Christian Danielsen`}
              style={{
                display: `inline`,
                width: rhythm(1.5),
                height: rhythm(1.5),
              }}
            />
          </p>
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
          <hr
            style={{
              marginBottom: rhythm(1),
            }}
          />
          <ul
            style={{
              display: `flex`,
              flexWrap: `wrap`,
              justifyContent: `space-between`,
              listStyle: `none`,
              padding: 0,
            }}
          >
            <li>
              {previous && (
                <Link to={previous.fields.slug} rel="prev">
                  ← {previous.frontmatter.title}
                </Link>
              )}
            </li>
            <li>
              {next && (
                <Link to={next.fields.slug} rel="next">
                  {next.frontmatter.title} →
                </Link>
              )}
            </li>
          </ul>
          <footer
            style={{
              textAlign: "center",
              fontSize: "x-small",
            }}
          >
            ©2019 Christian Danielsen. All Rights Reserved.
          </footer>
        </div>
      </Layout>
    )
  }
}

BlogPostTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        author
        date(formatString: "MMMM DD, YYYY")
        description
        splashUrl
        splashAuthor
        splashAuthorUrl
      }
    }
  }
`
