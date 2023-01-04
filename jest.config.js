module.exports = {
    "testEnvironment": "node",
    "coveragePathIgnorePatterns": [
      "/node_modules/",
    ],
    "modulePathIgnorePatterns": ["<rootDir>/client/"],
    "setupFilesAfterEnv": ["<rootDir>/setup-test.js"],
};
