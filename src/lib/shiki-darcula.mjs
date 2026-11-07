// Shiki port of the Prism "Darcula" theme (prism-themes) the Gatsby site used.
/** @type {import("shiki").ThemeRegistration} */
export default {
  name: "darcula",
  type: "dark",
  colors: {
    "editor.background": "#2b2b2b",
    "editor.foreground": "#a9b7c6",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#808080" },
    },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "constant.language",
        "support.type.property-name.css",
        "entity.other.attribute-name.class.css",
      ],
      settings: { foreground: "#cc7832" },
    },
    {
      scope: ["keyword.operator", "punctuation", "meta.brace"],
      settings: { foreground: "#a9b7c6" },
    },
    {
      scope: [
        "entity.name.tag",
        "support.class.builtin",
        "support.function.builtin",
      ],
      settings: { foreground: "#e8bf6a" },
    },
    {
      scope: ["constant.numeric", "constant.character.entity"],
      settings: { foreground: "#6897bb" },
    },
    {
      scope: [
        "variable.other.property",
        "variable.other.object.property",
        "variable.other.constant",
        "meta.object-literal.key",
      ],
      settings: { foreground: "#9876aa" },
    },
    {
      scope: ["string", "punctuation.definition.string"],
      settings: { foreground: "#6a8759" },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: { foreground: "#bababa" },
    },
    {
      scope: ["string.quoted.double.html", "string.quoted.single.html"],
      settings: { foreground: "#a5c261" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call entity.name.function",
      ],
      settings: { foreground: "#ffc66d" },
    },
    {
      scope: ["string.regexp"],
      settings: { background: "#364135" },
    },
    {
      scope: ["markup.underline.link"],
      settings: { foreground: "#287bde", fontStyle: "underline" },
    },
    { scope: ["markup.bold"], settings: { fontStyle: "bold" } },
    { scope: ["markup.italic"], settings: { fontStyle: "italic" } },
  ],
}
