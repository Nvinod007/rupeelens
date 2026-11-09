export default {
  displayName: 'rupeelens-fe',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
  },
  moduleNameMapper: {
    // App-local alias (`@/*`); the `@shared-*` aliases are resolved by the Nx preset.
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|svg|png|jpg|jpeg|webp)$': '<rootDir>/src/test/file-mock.ts',
  },
  testMatch: [
    '<rootDir>/{src,specs}/**/*.(spec|test).[jt]s?(x)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/rupeelens-fe',
};
