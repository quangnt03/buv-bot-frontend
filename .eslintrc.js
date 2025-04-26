module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Temporarily disable or reduce severity of problematic rules
    "@typescript-eslint/no-unused-vars": ["warn", { 
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_",
      "ignoreRestSiblings": true 
    }],
    "@typescript-eslint/no-explicit-any": "warn",
    "react/no-unescaped-entities": "warn",
  }
} 