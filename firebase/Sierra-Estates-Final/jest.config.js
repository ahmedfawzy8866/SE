module.exports = {
  projects: [
    {
      displayName: 'mobile',
      preset: 'jest-expo',
      setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
      roots: [
        '<rootDir>/app',
        '<rootDir>/components',
        '<rootDir>/lib',
        '<rootDir>/constants'
      ],
      testMatch: [
        '**/__tests__/**/*.test.[jt]s?(x)',
        '**/*.test.[jt]s?(x)'
      ],
      modulePathIgnorePatterns: [
        '<rootDir>/vendor',
        '<rootDir>/back',
        '<rootDir>/backend',
        '<rootDir>/packages/open-memory'
      ],
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
      ]
    },
    {
      displayName: 'agents',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: [
        '<rootDir>/packages',
        '<rootDir>/apps/agents',
      ],
      testMatch: [
        '**/__tests__/**/*.test.ts',
        '**/__tests__/**/*.test.js',
      ],
      modulePathIgnorePatterns: [
        '<rootDir>/vendor',
        '<rootDir>/back',
        '<rootDir>/backend',
        '<rootDir>/packages/open-memory'
      ],
      moduleNameMapper: {
        '^@sierra-estates/obedian$': '<rootDir>/packages/obedian/src/index.ts',
        '^@sierra-estates/memory-engine$': '<rootDir>/packages/memory-engine/src/index.ts',
        '^@sierra-estates/agents-core$': '<rootDir>/packages/agents-core/src/index.ts',
        '^@sierra-estates/db$': '<rootDir>/packages/db/lib/index.ts',
      },
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            esModuleInterop: true,
            moduleResolution: 'node',
            strict: false,
          },
        }],
      },
      collectCoverageFrom: [
        'packages/*/src/**/*.ts',
        'apps/agents/whatsapp-bot/**/*.ts',
        '!**/__tests__/**',
        '!**/node_modules/**',
        '!**/*.d.ts',
      ],
      coverageReporters: ['text', 'lcov', 'html'],
      coverageDirectory: './coverage',
      testTimeout: 30000,
      verbose: true,
    },
    {
      displayName: 'backend',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: [
        '<rootDir>/backend/src',
      ],
      testMatch: [
        '**/__tests__/**/*.test.ts',
        '**/__tests__/**/*.test.js',
      ],
      modulePathIgnorePatterns: [
        '<rootDir>/vendor',
      ],
      moduleNameMapper: {
        '^next/server$': '<rootDir>/backend/src/__mocks__/next-server.ts',
        '^@/(.*)$': '<rootDir>/backend/src/$1',
      },
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: '<rootDir>/backend/tsconfig.json',
        }],
      },
      testTimeout: 15000,
      verbose: true,
    }
  ]
};
