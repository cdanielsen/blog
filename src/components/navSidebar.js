import React from "react"
import { Link } from "gatsby"
import arrayShuffle from "array-shuffle"

import IconBox from "./iconBox"
import { rhythm } from "../utils/typography"
import headShot from "../../content/assets/headshot.png"

const coolPeople = arrayShuffle([
  ["Jake Archibald", "https://www.jakearchibald.com"],
  ["Flavio Copes", "https://flaviocopes.com/"],
  ["Tania Rascia", "https://www.taniarascia.com/"],
  ["Jim Fisher", "https://jameshfisher.com/"],
  ["Dave Cedia", "https://daveceddia.com/"],
  ["Julia Evans", "https://jvns.ca/"],
  ["Sarah Drasner", "https://sarah.dev/"],
  ["Juliette Pretot", "https://juliette.sh/"],
  ["Vivki Boykis", "https://vicki.substack.com/"],
  ["Sindre Sorhus", "https://sindresorhus.com/"],
])

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
        <div
          style={{
            textAlign: `center`,
          }}
        >
          <h4>Admirees</h4>
          {coolPeople.map(([name, link], idx) => (
            <div key={idx}>
              <a
                href={link}
                style={{
                  boxShadow: `none`,
                }}
              >
                {name}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
