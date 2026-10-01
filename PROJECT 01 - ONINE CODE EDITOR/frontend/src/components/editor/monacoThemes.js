export const CODEBUDDY_DARK = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', foreground: 'E2E8F0', background: '182033' },
    { token: 'comment', foreground: '64748B', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'FF7EB6', fontStyle: 'bold' }, // Pink for keywords
    { token: 'identifier', foreground: 'E2E8F0' },
    { token: 'type', foreground: '5BC0EB' }, // Sky blue
    { token: 'string', foreground: 'FFD166' }, // Warm yellow for strings
    { token: 'number', foreground: '65D6B3' }, // Mint green for numbers
    { token: 'delimiter', foreground: '94A3B8' },
    { token: 'tag', foreground: 'FF9F68', fontStyle: 'bold' }, // Orange for HTML tags
    { token: 'attribute.name', foreground: '9B6DFF' }, // Purple for attributes
    { token: 'attribute.value', foreground: 'FFD166' },
    { token: 'function', foreground: '5BC0EB', fontStyle: 'bold' }, // Sky blue for functions
    { token: 'variable', foreground: 'E2E8F0' },
    { token: 'operator', foreground: 'FF7EB6' },
  ],
  colors: {
    'editor.background': '#182033',
    'editor.foreground': '#E2E8F0',
    'editorCursor.foreground': '#FFD166',
    'editor.lineHighlightBackground': '#1E293B80',
    'editorLineNumber.foreground': '#475569',
    'editorLineNumber.activeForeground': '#FFD166',
    'editor.selectionBackground': '#9B6DFF40',
    'editor.inactiveSelectionBackground': '#9B6DFF20',
    'editorIndentGuide.background': '#25334D',
    'editorIndentGuide.activeBackground': '#5BC0EB',
    'editorBracketMatch.background': '#9B6DFF33',
    'editorBracketMatch.border': '#9B6DFF',
  },
};

export const CODEBUDDY_LIGHT = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: '', foreground: '182033', background: 'FFFFFF' },
    { token: 'comment', foreground: '94A3B8', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'E02477', fontStyle: 'bold' },
    { token: 'identifier', foreground: '182033' },
    { token: 'type', foreground: '0284C7' },
    { token: 'string', foreground: 'D97706' },
    { token: 'number', foreground: '0D9488' },
    { token: 'delimiter', foreground: '64748B' },
    { token: 'tag', foreground: 'EA580C', fontStyle: 'bold' },
    { token: 'attribute.name', foreground: '7C3AED' },
    { token: 'attribute.value', foreground: 'D97706' },
    { token: 'function', foreground: '0284C7', fontStyle: 'bold' },
    { token: 'variable', foreground: '1E293B' },
    { token: 'operator', foreground: 'DB2777' },
  ],
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#182033',
    'editorCursor.foreground': '#7C3AED',
    'editor.lineHighlightBackground': '#F8FAFC',
    'editorLineNumber.foreground': '#94A3B8',
    'editorLineNumber.activeForeground': '#7C3AED',
    'editor.selectionBackground': '#DDD6FE',
    'editorIndentGuide.background': '#E2E8F0',
    'editorIndentGuide.activeBackground': '#9B6DFF',
  },
};

export const registerMonacoThemes = (monaco) => {
  monaco.editor.defineTheme('codebuddy-dark', CODEBUDDY_DARK);
  monaco.editor.defineTheme('codebuddy-light', CODEBUDDY_LIGHT);
};
