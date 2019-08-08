import React from "react"
import PropTypes from "prop-types"
import NavSidebar from "../navSidebar"

import Header from "./header"
import { rhythm } from "../../utils/typography"

class Layout extends React.Component {
  render() {
    const isIndexPage = this.props.location.pathname === `${__PATH_PREFIX__}/`
    const { location, children } = this.props

    if (isIndexPage) {
      return (
        <>
          <div
            style={{
              marginLeft: `auto`,
              marginRight: `auto`,
              maxWidth: rhythm(30),
              padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
              display: `flex`,
              flexDirection: `row`,
            }}
          >
            <div
              style={{
                flexGrow: 1,
                paddingRight: `30px`,
                borderRight: `0.5px solid`,
                maxHeight: `500px`,
                minWidth: `125px`,
              }}
            >
              <NavSidebar />
            </div>

            <div
              style={{
                flexGrow: 2,
                paddingLeft: `50px`,
              }}
            >
              <Header location={location} />
              <main>{children}</main>
            </div>
          </div>
        </>
      )
    }
    return (
      <div
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        <Header location={location} />
        <main>{children}</main>
      </div>
    )
  }
}

export default Layout

Layout.propTypes = {
  location: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
}
