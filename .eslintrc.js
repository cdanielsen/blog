module.exports = {
  parser: "babel-eslint",
  rules: {
    "strict": 0
  },
  env: {
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
  ],
  globals: {
    __PATH_PREFIX__: true,
  }
}