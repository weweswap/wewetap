module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/vue3-essential',
        'plugin:import/recommended',
        'eslint:recommended'
    ],
    rules: {
        'linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix'],
        'vue/max-len': [
            'error',
            {
                code: 120,
                template: 120,
                ignorePattern: 'd="([\\s\\S]*?)"',
                ignoreRegExpLiterals: true
            }
        ],
        'comma-dangle': [2, 'never'],
        'eol-last': 'error',
        'import/order': [
            'error',
            {
                alphabetize: {
                    caseInsensitive: true,
                    order: 'asc'
                },
                groups: ['builtin', 'external', 'index', 'sibling', 'parent', 'internal']
            }
        ],
        'jsx-quotes': [2, 'prefer-single'],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'no-duplicate-imports': 'error',
        'no-prototype-builtins': 'off',
        'no-unused-vars': 'warn',
        'vue/multi-word-component-names': 'off',
        'vue/no-setup-props-destructure': 'off',
        'vue/attribute-hyphenation': ['error', 'never'],
        'vue/v-on-event-hyphenation': ['error', 'never'],
        'object-curly-spacing': [2, 'always'],
        quotes: [2, 'single'],
        semi: 'error',
        'sort-imports': [
            'error',
            {
                ignoreCase: false,
                ignoreDeclarationSort: true,
                ignoreMemberSort: false
            }
        ]
    },
    parserOptions: {
        ecmaVersion: 'latest'
    },
    settings: {
        'import/resolver': {
            alias: {
                map: [['@', './src']],
                extensions: ['.js', '.jsx', '.vue']
            }
        }
    }
};
