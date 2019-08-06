import React from "react"
import { Link } from "gatsby"

import IconBox from "./iconBox"
import { rhythm } from "../utils/typography"
import headShot from "../../content/assets/headshot.png"

export default function NavSidebar() {
  return (
    <div
      style={{
        display: `flex`,
        flexDirection: `column`,
        minWidth: `125px`,
      }}
    >
      <img
        src={headShot}
        alt={`Christian Danielsen`}
        style={{
          display: `block`,
          margin: `0 auto`,
          width: rhythm(4),
          height: rhythm(4),
        }}
      />
      <div
        style={{
          flexGrow: 1,
        }}
      >
        <h4
          style={{
            textAlign: `center`,
            marginTop: `47px`,
          }}
        >
          <Link
            to="/about"
            style={{
              boxShadow: `none`,
              margin: `0 auto`,
            }}
          >
            Who Dis?
          </Link>
        </h4>
        <IconBox />
      </div>
    </div>
  )
}
