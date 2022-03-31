module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["plugin:vue/recommended", "eslint:recommended", "@vue/prettier"],
  parserOptions: {
    parser: "babel-eslint",
  },
  plugins: ["simple-import-sort"],
  rules: {
    curly: 1,
    eqeqeq: "warn",
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "simple-import-sort/imports": [
      "warn",
      {
        groups: [["^\\u0000", "^@?\\w", "^[^.]", "^\\."]],
      },
    ],
  },
};
