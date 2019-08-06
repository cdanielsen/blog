import React from "react"
import PropTypes from "prop-types"

import Layout from "../../components/layout"
import { rhythm } from "../../utils/typography"
import headshot from "../../../content/assets/headshot.png"

export default function AboutPage({ location }) {
  return (
    <Layout location={location}>
      <img
        src={headshot}
        alt={`Christian Danielsen`}
        style={{
          display: `block`,
          margin: `0 auto`,
          width: rhythm(10),
          height: `auto`,
        }}
      />
      <p></p>
      <h3>Hello!</h3>
      <p>
        I&apos;m Christian Danielsen, a web developer working remotely in Hood
        River, OR
      </p>

      <p>
        Some things I&apos;m into: JavaScript (particularly node.js), the art of
        writing tests, continuous everything, and working on teams with a
        diverse group of people.
      </p>
      <p>
        <h3>(In)Frequently Asked Questions:</h3>
        <p>
          <strong>Q: HotMess?</strong>
        </p>
        <p>
          A: I hiked the Pacific Crest Trail in 2010. On a long trail, it{"'"}s
          a tradition to adopt an alter ego (a trail name). My propensity for
          misplacing things landed me the title of {"'"}HotMess{"'"}.
        </p>
        <p>
          <strong>Q: What{"'"}s with the masthead?</strong>
        </p>
        <p>
          A: If you work with JavaScript, you&apos;ve probably encountered the
          famous{" "}
          <a href="https://www.destroyallsoftware.com/talks/wat">wat talk</a>,
          detailing some of JavaScript{"'"}s best... eccentricities. I{"'"}m so
          enamored with the masthead expression (which evaluates to true in JS),
          that I{"'"}m considering getting a tattoo of it.
        </p>
      </p>
    </Layout>
  )
}

AboutPage.propTypes = {
  location: PropTypes.object.isRequired,
}
