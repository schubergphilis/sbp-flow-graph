module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react-hooks/recommended',
		'prettier'
	],
	ignorePatterns: ['dist', '.eslintrc.cjs', 'vite-env.d.ts'],
	parser: '@typescript-eslint/parser',
	plugins: ['react-refresh', 'prettier'],
	rules: {
		'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
		'react/react-in-jsx-scope': 'off',
		camelcase: 'error',
		'spaced-comment': 'error',
		quotes: ['error', 'single'],
		'no-duplicate-imports': 'error',
		'react/prop-types': 'off',
		'@typescript-eslint/no-empty-object-type': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unused-vars': [
			'error', // or "error"
			{
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				caughtErrorsIgnorePattern: '^_'
			}
		]
	}
}
