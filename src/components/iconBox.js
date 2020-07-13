import React, { useEffect, useState } from "react"
import {
  FaTwitter,
  FaGithub,
  FaLinkedinIn,
  FaRssSquare,
  FaDev,
} from "react-icons/fa"
import { IoIosPaperPlane } from "react-icons/io"

import arrayShuffle from "array-shuffle"

export default function IconBox() {
  const iconsInitial = [
    [FaTwitter, "http://twitter.com/ckdanielsen"],
    [FaGithub, "http://github.com/cdanielsen"],
    [FaLinkedinIn, "http://linkedin.com/in/christiandanielsen"],
    [IoIosPaperPlane, "mailto:ckdanielsen@gmail.com"],
    [FaRssSquare, "https://www.hotmess.codes/rss.xml"],
    [FaDev, "https://dev.to/cdanielsen"],
  ]

  const [icons, setIcons] = useState(iconsInitial)

  useEffect(() => {
    setIcons(arrayShuffle(icons))
  }, [])

  return (
    <div
      style={{
        display: `flex`,
        flexDirection: `row`,
        flexWrap: `wrap`,
        justifyContent: `space-around`,
        paddingBottom: `20px`,
        borderBottom: `0.5px solid`,
      }}
    >
      {icons.map(([icon, link], idx) => (
        <a
          key={idx}
          href={link}
          style={{
            color: `inherit`,
            padding: `5px`,
          }}
        >
          {React.createElement(icon, {
            size: `1.75rem`,
          })}
        </a>
      ))}
    </div>
  )
}
