import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw, Sparkles, CheckCircle2, XCircle, Clock,
  Terminal, MessageSquare, AlertCircle, Eye
} from 'lucide-react';
import ByteMascot from '../mascot/ByteMascot';

export const OutputPanel = ({
  language = 'html',
  files = [],
  outputData,
  isRunning,
  onRun,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview', 'console', 'errors'
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [runtimeError, setRuntimeError] = useState(null);
  const [previewKey, setPreviewKey] = useState(0);
  const iframeRef = useRef(null);

  // When code runs or outputData changes, refresh the preview
  useEffect(() => {
    if (outputData) {
      setPreviewKey((k) => k + 1);
      setRuntimeError(null);
    }
  }, [outputData]);

  // Construct combined sandboxed HTML document
  const buildPreviewDoc = () => {
    const htmlFile = files.find((f) => f.filename.toLowerCase().endsWith('.html'))?.content || '';
    const cssFile = files.find((f) => f.filename.toLowerCase().endsWith('.css'))?.content || '';
    const jsFiles = files
      .filter((f) => f.filename.toLowerCase().endsWith('.js'))
      .map((f) => f.content)
      .join('\n');

    // Create the script interceptor for console and errors
    const interceptorScript = `
    <script>
      (function() {
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        function sendToParent(type, args) {
          try {
            const serialized = Array.from(args).map(arg => {
              if (typeof arg === 'object') {
                try { return JSON.stringify(arg, null, 2); } catch(e) { return String(arg); }
              }
              return String(arg);
            }).join(' ');
            window.parent.postMessage({ type: 'CODEBUDDY_CONSOLE', level: type, message: serialized }, '*');
          } catch(e) {}
        }

        console.log = function(...args) {
          sendToParent('log', args);
          originalLog.apply(console, args);
        };
        console.warn = function(...args) {
          sendToParent('warn', args);
          originalWarn.apply(console, args);
        };
        console.error = function(...args) {
          sendToParent('error', args);
          originalError.apply(console, args);
        };

        window.onerror = function(message, source, lineno, colno, error) {
          window.parent.postMessage({
            type: 'CODEBUDDY_RUNTIME_ERROR',
            message: String(message),
            line: lineno,
            col: colno,
            stack: error ? error.stack : ''
          }, '*');
          return false;
        };

        window.addEventListener('unhandledrejection', function(event) {
          window.parent.postMessage({
            type: 'CODEBUDDY_RUNTIME_ERROR',
            message: 'Unhandled Promise Rejection: ' + (event.reason ? (event.reason.message || event.reason) : 'Unknown'),
            line: 0
          }, '*');
        });
      })();
    </script>
    `;

    // If htmlFile has a <head> tag, inject style and interceptor into <head>
    // Otherwise construct a full HTML5 document
    let fullHtml = '';
    const hasHtmlTag = /<html[\s>]/i.test(htmlFile);

    if (hasHtmlTag) {
      // Inject CSS into <head> if present, or before </body>
      let doc = htmlFile;
      const headIndex = doc.toLowerCase().indexOf('</head>');
      if (headIndex !== -1) {
        doc =
          doc.slice(0, headIndex) +
          `<style>\n${cssFile}\n</style>\n${interceptorScript}\n` +
          doc.slice(headIndex);
      } else {
        doc = `<style>\n${cssFile}\n</style>\n${interceptorScript}\n` + doc;
      }

      // Inject JS before </body> or at the end
      const bodyIndex = doc.toLowerCase().indexOf('</body>');
      if (bodyIndex !== -1) {
        doc =
          doc.slice(0, bodyIndex) +
          `\n<script>\ntry {\n${jsFiles}\n} catch(err) {\n  window.onerror(err.message, '', 0, 0, err);\n}\n</script>\n` +
          doc.slice(bodyIndex);
      } else {
        doc += `\n<script>\ntry {\n${jsFiles}\n} catch(err) {\n  window.onerror(err.message, '', 0, 0, err);\n}\n</script>\n`;
      }
      fullHtml = doc;
    } else {
      fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
${cssFile}
  </style>
${interceptorScript}
</head>
<body>
${htmlFile}
<script>
try {
${jsFiles}
} catch(err) {
  window.onerror(err.message, '', 0, 0, err);
}
</script>
</body>
</html>`;
    }

    return fullHtml;
  };

  // Listen for console and error messages from sandboxed iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'CODEBUDDY_CONSOLE') {
        setConsoleLogs((prev) => [
          ...prev,
          {
            level: event.data.level,
            message: event.data.message,
            time: new Date().toLocaleTimeString(),
          },
        ]);
      } else if (event.data?.type === 'CODEBUDDY_RUNTIME_ERROR') {
        setRuntimeError({
          message: event.data.message,
          line: event.data.line,
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRefreshPreview = () => {
    setPreviewKey((k) => k + 1);
    setConsoleLogs([]);
    setRuntimeError(null);
  };

  // Educational advice from Byte for JavaScript errors
  const getJavaScriptErrorAdvice = () => {
    if (!runtimeError) return null;
    const msg = runtimeError.message || '';

    if (msg.includes('is not defined')) {
      return "Byte spotted an undefined variable! 🔍 Make sure you declared your variable or checked the spelling of your function name.";
    }
    if (msg.includes('is not a function')) {
      return "Byte noticed a function call issue! 🧩 The item you're calling isn't a function. Check your spelling or ensure it exists!";
    }
    if (msg.includes('Cannot read properties of null') || msg.includes('Cannot read property')) {
      return "Byte says: An element was not found in the HTML! 🕵️‍♂️ Check that document.getElementById() matches your HTML element id.";
    }
    if (msg.includes('Unexpected token')) {
      return "Byte found a syntax typo! 🔧 Check for missing parentheses (), brackets [], or quotation marks \"\".";
    }
    return "Every bug is a clue! 🕵️ Read the JavaScript error message below to help Byte track it down.";
  };

  return (
    <div className={`flex flex-col h-full bg-[#182033] text-slate-200 select-none ${className}`}>
      {/* Panel Tab Header */}
      <div className="flex items-center justify-between bg-[#0F172A] border-b border-[#334155] px-3 py-1 text-xs font-bold">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-[#182033] text-[#5BC0EB] border-b-2 border-[#5BC0EB]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye size={13} />
            <span>Live Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1.5 rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'console'
                ? 'bg-[#182033] text-[#9B6DFF] border-b-2 border-[#9B6DFF]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal size={13} />
            <span>Console</span>
            {consoleLogs.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#9B6DFF]/30 text-[#9B6DFF] text-[10px] rounded-full">
                {consoleLogs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('errors')}
            className={`px-3 py-1.5 rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'errors'
                ? 'bg-[#182033] text-[#FF7EB6] border-b-2 border-[#FF7EB6]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare size={13} />
            <span>Byte's Clues</span>
            {runtimeError && (
              <span className="w-2 h-2 rounded-full bg-[#FF7EB6] inline-block animate-ping" />
            )}
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshPreview}
            className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
            title="Refresh Live Preview"
          >
            <RotateCcw size={13} />
          </button>
          <span className="text-[10px] text-[#65D6B3] flex items-center gap-1 font-mono">
            <CheckCircle2 size={11} />
            Browser Sandbox Active
          </span>
        </div>
      </div>

      {/* Panel Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* 1. Preview Tab (Sandboxed iframe) */}
        {activeTab === 'preview' && (
          <div className="w-full h-full bg-white relative">
            <iframe
              key={previewKey}
              ref={iframeRef}
              title="CodeBuddy Live Preview Sandbox"
              sandbox="allow-scripts allow-modals"
              srcDoc={buildPreviewDoc()}
              className="w-full h-full border-none"
            />
            {/* Small floating banner if there's an error */}
            {runtimeError && (
              <div
                onClick={() => setActiveTab('errors')}
                className="absolute bottom-3 right-3 bg-red-900/90 text-red-200 border border-red-500 px-3 py-1.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-red-800 transition-colors"
                title="Click to see error details"
              >
                <AlertCircle size={14} className="text-red-400" />
                <span>JavaScript Error in Preview — Click for details</span>
              </div>
            )}
          </div>
        )}

        {/* 2. Console Logs Tab */}
        {activeTab === 'console' && (
          <div className="p-3 h-full overflow-y-auto font-mono text-xs bg-[#182033] space-y-1.5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span>Captured JavaScript Console Logs</span>
              <button
                onClick={() => setConsoleLogs([])}
                className="hover:text-white cursor-pointer px-2 py-0.5 bg-slate-800 rounded text-[10px]"
              >
                Clear Logs
              </button>
            </div>
            {consoleLogs.length === 0 ? (
              <div className="text-slate-500 italic py-4 text-center">
                No logs yet. Call <code className="text-[#FFD166]">console.log("Hello!")</code> in script.js and click <strong>RUN</strong>!
              </div>
            ) : (
              consoleLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg flex items-start gap-2 ${
                    log.level === 'error'
                      ? 'bg-red-950/40 text-red-300 border border-red-900/50'
                      : log.level === 'warn'
                      ? 'bg-amber-950/40 text-amber-300 border border-amber-900/50'
                      : 'text-slate-200 bg-[#0F172A]'
                  }`}
                >
                  <span className="text-slate-500 text-[10px]">{log.time}</span>
                  <span className="font-bold uppercase text-[10px]">[{log.level}]</span>
                  <pre className="whitespace-pre-wrap flex-1">{log.message}</pre>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. Byte's Clues / Educational Errors Tab */}
        {activeTab === 'errors' && (
          <div className="p-4 h-full overflow-y-auto bg-[#182033] flex flex-col items-center justify-center text-center">
            {runtimeError ? (
              <div className="max-w-md w-full bg-[#1E293B] border-2 border-[#FF7EB6] p-5 rounded-2xl shadow-lg text-left">
                <div className="flex items-center gap-3 mb-3">
                  <ByteMascot mood="thinking" size="sm" />
                  <div>
                    <h3 className="font-heading text-base font-bold text-[#FF7EB6]">
                      Byte's Detective Note 🔍
                    </h3>
                    <p className="text-xs text-slate-300">
                      {getJavaScriptErrorAdvice()}
                    </p>
                  </div>
                </div>

                <div className="bg-[#0F172A] p-3 rounded-xl border border-red-900/50">
                  <div className="text-[11px] font-bold text-red-400 mb-1 flex items-center justify-between">
                    <span>JavaScript Error</span>
                    {runtimeError.line > 0 && <span>Line {runtimeError.line}</span>}
                  </div>
                  <div className="border-b border-red-900/40 my-1" />
                  <pre className="whitespace-pre-wrap font-mono text-xs text-red-300">
                    {runtimeError.message}
                  </pre>
                </div>

                <button
                  onClick={() => setRuntimeError(null)}
                  className="mt-3 px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ByteMascot mood="happy" size="md" />
                <h3 className="font-heading text-base font-bold text-[#65D6B3] mt-3">
                  All Clear, Superstar! 🚀
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  No JavaScript errors detected in the preview sandbox. Your webpage is running smoothly!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
