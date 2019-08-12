import React from "react"
import PropTypes from "prop-types"
import { graphql, Link, useStaticQuery } from "gatsby"

import { rhythm, scale } from "../../utils/typography"

function Header({ location }) {
  const data = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            masthead
          }
        }
      }
    `
  )
  const { masthead, description, title } = data.site.siteMetadata
  const rootPath = `${__PATH_PREFIX__}/`
  const indexHeader = (
    <header>
      <h1
        style={{
          ...scale(1),
          marginBottom: rhythm(1),
          marginTop: 0,
          textAlign: `center`,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            textDecoration: `none`,
            color: `inherit`,
          }}
          to={`/`}
        >
          {masthead}
        </Link>
      </h1>
      <h4
        style={{
          textAlign: `center`,
          margin: `1rem auto`,
        }}
      >
        {description}
      </h4>
    </header>
  )

  const nonIndexHeader = (
    <header>
      <h2
        style={{
          fontFamily: `Montserrat, sans-serif`,
          marginTop: 0,
          textAlign: `center`,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            textDecoration: `none`,
            color: `inherit`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h2>
    </header>
  )

  const header = location.pathname === rootPath ? indexHeader : nonIndexHeader

  return header
}

Header.propTypes = {
  location: PropTypes.object.isRequired,
}

export default Header
