// const { defineConfig, globalIgnores } = require('eslint/config')

// const globals = require('globals')

// const { fixupConfigRules } = require('@eslint/compat')

// const tsParser = require('@typescript-eslint/parser')
// const reactRefresh = require('eslint-plugin-react-refresh')
// const prettier = require('eslint-plugin-prettier')
// const js = require('@eslint/js')

// const { FlatCompat } = require('@eslint/eslintrc')
import { fixupConfigRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
})

export default defineConfig([
	{
		languageOptions: {
			globals: {
				...globals.browser
			},

			parser: tsParser
		},

		extends: fixupConfigRules(
			compat.extends(
				'eslint:recommended',
				'plugin:@typescript-eslint/recommended',
				'plugin:react-hooks/recommended',
				'prettier'
			)
		),

		plugins: {
			'react-refresh': reactRefresh,
			prettier
		},

		rules: {
			'react-refresh/only-export-components': [
				'warn',
				{
					allowConstantExport: true
				}
			],

			'react/react-in-jsx-scope': 'off',
			camelcase: 'error',
			'spaced-comment': 'error',
			quotes: ['error', 'single'],
			'no-duplicate-imports': 'error',
			'react/prop-types': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-explicit-any': 'off',

			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			]
		}
	},
	globalIgnores(['**/dist', '**/.eslintrc.cjs', '**/vite-env.d.ts'])
])
