import React, { useState, useEffect } from "react"
import { Link } from "gatsby"
import arrayShuffle from "array-shuffle"

import IconBox from "./iconBox"
import { rhythm } from "../utils/typography"
import headShot from "../../content/assets/headshot.png"

export default function NavSidebar() {
  const coolPeopleInitial = [
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
  ]

  const [coolPeopleRandom, setCoolPeople] = useState(coolPeopleInitial)

  useEffect(() => {
    setCoolPeople(arrayShuffle(coolPeopleRandom))
  }, [])

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
            marginTop: `14px`,
            marginBottom: `14px`,
          }}
        >
          <Link
            to="/about"
            style={{
              margin: `0 auto`,
            }}
          >
            This Guy
          </Link>
        </h4>
        <h4
          style={{
            textAlign: `center`,
            marginTop: `14px`,
            marginBottom: `14px`,
          }}
        >
          <a
            href="/resume.pdf"
            target="_blank"
            style={{
              margin: `0 auto`,
            }}
          >
            Resume
          </a>
        </h4>
        <IconBox />
        <div
          style={{
            textAlign: `center`,
          }}
        >
          <h4>Admirees</h4>
          {coolPeopleRandom.map(([name, link]) => (
            <div key={name + link}>
              <a href={link}>{name}</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
