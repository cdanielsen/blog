import React from "react"
import PropTypes from "prop-types"

import credentials from "../../../resumeContent"
import Layout from "../../components/layout"

const {
  tagLine,
  webdevExperience,
  technicalSkills,
  essentialSkills,
  education,
  communityContributions,
  personalInterests,
} = credentials

export default function ResumePage({ location }) {
  return (
    <Layout location={location} includeHeader={false}>
      <h1 style={{ marginTop: 15, marginBottom: 15 }}>Christian Danielsen</h1>
      <p>{tagLine}</p>
      {/*
        TECHNICAL SKILLS
      */}
      <h3>Technical Skills</h3>
      {technicalSkills.map(({ label, content }, idx) => (
        <p key={idx}>
          <strong>{label}</strong>
          <br />
          {content.join(", ")}
        </p>
      ))}
      {/*
        ESSENTIAL SKILLS
      */}
      <h3>Essential Human / Developer Skills</h3>
      <ul>
        {essentialSkills.map((essentialSkill, idx) => (
          <li key={idx}>{essentialSkill}</li>
        ))}
      </ul>
      {/*
        DEV EXPERIENCE
      */}
      <h3>Development Experience</h3>
      {webdevExperience.map((role, idx) => (
        <div key={idx}>
          <strong>
            {role.title} - {role.company}
          </strong>
          <br />
          <em>
            {role.location} ({role.startDate} - {role.endDate})
          </em>
          <ul>
            {role.highlights.map((highlight, idx) => {
              return <li key={idx}>{highlight}</li>
            })}
          </ul>
        </div>
      ))}
      {/*
        EDUCATION & TRAINING
      */}
      <h3>Education & Training</h3>
      {education
        .sort(({ date1 }, { date2 }) => date1 - date2)
        .reverse()
        .map(({ date, duration, institution, location, title }, idx) => (
          <p key={idx + title}>
            {date} - {title}
            {duration ? ` (${duration})` : ""}, {institution}, {location}
          </p>
        ))}
      {/*
        COMMUNITY CONTRIBUTIONS
      */}
      <h3>Community Contributions</h3>
      {communityContributions.map(
        ({ role, title, location, description, year }) => (
          <>
            <p key={title}>
              <strong>
                {role}, {title} ({year} - {location})
              </strong>
              <br />
              {description}
            </p>
          </>
        )
      )}
      {/*
        PERSONAL INTERESTS
      */}
      <h3>Personal Interests</h3>
      <p>{personalInterests.join(" | ")}</p>
    </Layout>
  )
}

ResumePage.propTypes = {
  location: PropTypes.object.isRequired,
}
