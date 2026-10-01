import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { registerMonacoThemes } from './monacoThemes';
import { useSettings } from '../../context/SettingsContext';

const getMonacoLanguage = (filename) => {
  const ext = filename?.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html': return 'html';
    case 'css': return 'css';
    case 'js':
    case 'javascript': return 'javascript';
    case 'json': return 'json';
    default: return 'plaintext';
  }
};

const getFileTabIcon = (filename) => {
  const ext = filename?.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html': return '🌐';
    case 'css': return '🎨';
    case 'js':
    case 'javascript': return '⚡';
    case 'json': return '📋';
    default: return '📄';
  }
};

export const CodeEditor = ({
  file,
  files = [],
  onSelectFile,
  onChange,
  onRun,
  onSave,
  className = '',
}) => {
  const editorRef = useRef(null);
  const { settings } = useSettings();

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    registerMonacoThemes(monaco);

    // Apply CodeBuddy theme
    monaco.editor.setTheme(settings.theme || 'codebuddy-dark');

    // Add keyboard shortcuts
    // Ctrl+Enter or Cmd+Enter -> Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun) onRun();
    });

    // Ctrl+S or Cmd+S -> Save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSave) onSave();
    });
  };

  useEffect(() => {
    if (editorRef.current && window.monaco) {
      window.monaco.editor.setTheme(settings.theme || 'codebuddy-dark');
    }
  }, [settings.theme]);

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#182033] text-slate-400 font-mono text-sm">
        Select a file from the tabs above or explorer to view code.
      </div>
    );
  }

  const monacoLanguage = getMonacoLanguage(file.filename);

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${className}`}>
      {/* File Tabs Bar (index.html | style.css | script.js) */}
      <div className="bg-[#0F172A] border-b border-[#334155] px-2 pt-1 flex items-center gap-1.5 overflow-x-auto select-none">
        {files.length > 0 ? (
          files.map((f) => {
            const isActive = f.id === file.id;
            const lang = getMonacoLanguage(f.filename);
            const icon = getFileTabIcon(f.filename);

            return (
              <button
                key={f.id}
                onClick={() => onSelectFile && onSelectFile(f.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-t-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#182033] text-[#FFD166] border-t-2 border-[#5BC0EB]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title={`Switch to ${f.filename} (${lang})`}
              >
                <span>{icon}</span>
                <span>{f.filename}</span>
                {isActive && (
                  <span className="text-[10px] text-slate-500 font-normal">
                    ({lang})
                  </span>
                )}
              </button>
            );
          })
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold text-[#FFD166] bg-[#182033] rounded-t-lg border-t-2 border-[#5BC0EB]">
            <span>{getFileTabIcon(file.filename)}</span>
            <span>{file.filename}</span>
            <span className="text-[10px] text-slate-500 font-normal">
              ({monacoLanguage})
            </span>
          </div>
        )}
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full h-full relative">
        <Editor
          height="100%"
          language={monacoLanguage}
          value={file.content}
          theme={settings.theme || 'codebuddy-dark'}
          onMount={handleEditorDidMount}
          onChange={(val) => onChange(file.id, val ?? '')}
          options={{
            fontSize: settings.fontSize || 15,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            tabSize: settings.tabSize || 2,
            wordWrap: settings.wordWrap || 'on',
            minimap: { enabled: settings.minimap ?? false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            bracketPairColorization: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
            renderLineHighlight: 'all',
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
