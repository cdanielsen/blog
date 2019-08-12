import React from "react"
import { FaTwitter, FaGithub, FaLinkedinIn, FaRssSquare } from "react-icons/fa"
import { IoIosPaperPlane } from "react-icons/io"

export default function IconBox() {
  return (
    <div
      style={{
        display: `flex`,
        flexDirection: `row`,
        flexWrap: `wrap`,
        justifyContent: `space-around`,
      }}
    >
      {[
        [FaTwitter, "http://twitter.com/ckdanielsen"],
        [FaGithub, "http://github.com/cdanielsen"],
        [FaLinkedinIn, "http://linkedin.com/in/christiandanielsen"],
        [IoIosPaperPlane, "mailto:ckdanielsen@gmail.com"],
        [FaRssSquare, "https://www.hotmess.codes/rss.xml"],
      ].map((icon, idx) => (
        <a
          key={idx}
          href={icon[1]}
          style={{
            boxShadow: `none`,
            textDecoration: `none`,
            color: `inherit`,
            padding: `5px`,
          }}
        >
          {React.createElement(icon[0], {
            size: `2rem`,
          })}
        </a>
      ))}
    </div>
  )
}
