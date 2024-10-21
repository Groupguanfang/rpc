import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  rules: {
    'ts/no-redeclare': 'off',
    'ts/method-signature-style': 'off',
    'ts/no-namespace': 'off',
    'no-console': 'off',
  },
})
