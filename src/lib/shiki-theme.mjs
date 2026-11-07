// Synthwave-ish Shiki theme matching the site palette. Code blocks use it in
// both the dark and light site themes.
/** @type {import("shiki").ThemeRegistration} */
export default {
  name: "hotmess",
  type: "dark",
  colors: {
    "editor.background": "#1a0b2e",
    "editor.foreground": "#ece6ff",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#8a7fa8", fontStyle: "italic" },
    },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "constant.language",
        "entity.name.tag",
        "support.type.property-name.css",
      ],
      settings: { foreground: "#ff2a6d" },
    },
    {
      scope: ["keyword.operator", "punctuation", "meta.brace"],
      settings: { foreground: "#ece6ff" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "entity.name.type",
        "entity.name.class",
        "support.class",
        "support.type",
        "entity.other.attribute-name.class.css",
      ],
      settings: { foreground: "#36f9f6" },
    },
    {
      scope: ["string", "punctuation.definition.string", "string.template"],
      settings: { foreground: "#fede5d" },
    },
    {
      scope: ["constant.numeric", "constant.character", "support.constant"],
      settings: { foreground: "#ff8b39" },
    },
    {
      scope: [
        "variable.parameter",
        "entity.other.attribute-name",
        "meta.object-literal.key",
      ],
      settings: { foreground: "#c4b5fd" },
    },
    {
      scope: ["markup.underline.link"],
      settings: { foreground: "#36f9f6", fontStyle: "underline" },
    },
    { scope: ["markup.bold"], settings: { fontStyle: "bold" } },
    { scope: ["markup.italic"], settings: { fontStyle: "italic" } },
  ],
}
