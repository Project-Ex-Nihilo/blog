module.exports = {
    languageOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
        globals: {
            window: 'readonly',
            document: 'readonly',
        }
    },
    rules: {
        'semi': ['error', 'always'],
        'quotes': ['error', 'double'],
        'indent': ['error', 4],
        'no-unused-vars': 'error'
    }
};
