module.exports = {
  extends: ['../../.eslintrc.js'],
  root: true,
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        project: './tsconfig.json',
        extraFileExtensions: ['.vue']
      }
    }
  ]
}
