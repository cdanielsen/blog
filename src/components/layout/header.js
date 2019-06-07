import React from "react"
import PropTypes from "prop-types"
import { graphql, Link, useStaticQuery } from "gatsby"
import tyler from "../../../content/assets/profile-pic.jpg"

import { rhythm, scale } from "../../utils/typography"

function Header({ location }) {
  const data = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
          }
        }
      }
    `
  )
  const { title, description } = data.site.siteMetadata
  const rootPath = `${__PATH_PREFIX__}/`

  const indexHeader = (
    <header>
      <h1
        style={{
          ...scale(1.5),
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
          {title}
        </Link>
      </h1>
      <img
        src={tyler}
        alt={`Christian Danielsen`}
        style={{
          display: `block`,
          margin: `0 auto`,
          width: rhythm(4),
          height: rhythm(4),
        }}
      />
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
      <h3
        style={{
          fontFamily: `Montserrat, sans-serif`,
          marginTop: 0,
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
      </h3>
    </header>
  )

  const header = location.pathname === rootPath ? indexHeader : nonIndexHeader

  return header
}

Header.propTypes = {
  location: PropTypes.string.isRequired,
}

export default Header
