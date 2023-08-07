import React from "react"
import PropTypes from "prop-types"

import credentials from "./resumeContent"
import Layout from "../../components/layout"

const {
  tagLine,
  webdevExperience,
  technicalSkills,
  essentialSkills,
  education,
  communityContributions,
  personalInterests,
  contactInformation,
} = credentials

// Can use this for shorter resume, rather than CV
const MAX_NUMBER_RECENT_EXPERIENCE = 4

export default function ResumePage({ location }) {
  return (
    <Layout location={location} includeHeader={false}>
      <h1 style={{ marginTop: 10, marginBottom: 15 }}>Christian Danielsen</h1>
      <p>{tagLine}</p>
      {/*
        TECHNICAL SKILLS
      */}
      <h3>Technical Skills & Experience</h3>
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
      {webdevExperience
        .map((role, idx) => (
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
                return (
                  <li key={idx} className="resume__experience__item">
                    {highlight}
                  </li>
                )
              })}
            </ul>
          </div>
        ))
        .slice(0, MAX_NUMBER_RECENT_EXPERIENCE)}
      {/*
        EDUCATION & TRAINING
      */}
      <h3 className="resume__education-training__header">
        Education & Training
      </h3>
      {[
        ...education.sort(
          ({ date: nextDate }, { date: currentDate }) => currentDate - nextDate
        ),
      ].map(({ date, duration, institution, location, title }, idx) => (
        <p key={idx + title} className="resume__education-training__item">
          {date} - {title}
          {duration ? ` (${duration})` : ""}, {institution}, {location}
        </p>
      ))}
      {/*
        COMMUNITY CONTRIBUTIONS
      */}
      <h3 className="resume__contributions__header">Community Contributions</h3>
      {communityContributions.map(
        ({ role, title, location, description, year }) => (
          <>
            <p key={title} className="resume__contributions__item">
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
      <h3 className="resume__personal__header">Personal Interests</h3>
      <p className="resume__personal__item">{personalInterests.join(" | ")}</p>
      {/*
        CONTACT
      */}
      <h3 className="resume__personal__header">Contact</h3>
      <p className="resume__personal__item">{contactInformation.join(" | ")}</p>
    </Layout>
  )
}

ResumePage.propTypes = {
  location: PropTypes.object.isRequired,
}
