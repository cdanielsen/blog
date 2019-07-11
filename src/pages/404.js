import React from "react"
import PropTypes from "prop-types"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

class NotFoundPage extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title="404: Not Found" />
        <h1>Not Found</h1>
        <p>
          Well s***, this page does not exist.{" "}
          <a href="http://twitter.com/ckdanielsen">@</a> me if you think it
          should.
        </p>
      </Layout>
    )
  }
}

NotFoundPage.propTypes = {
  data: PropTypes.object.isRequired,
  location: PropTypes.string.isRequired,
}

export default NotFoundPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
