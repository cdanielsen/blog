import React from "react"
import PropTypes from "prop-types"

import Header from "./header"
import { rhythm } from "../../utils/typography"

class Layout extends React.Component {
  render() {
    const { location, children } = this.props
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
