// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ["expo", "eslint:recommended", "plugin:prettier/recommended"],
  rules: {
    semi: ["error", "never"],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
  },
  env: {
    browser: true,
  },
  ignorePatterns: ["/dist/*"],
}
