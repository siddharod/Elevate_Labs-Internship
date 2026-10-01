import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TopToolbar from '../components/editor/TopToolbar';
import FileExplorer from '../components/editor/FileExplorer';
import CodeEditor from '../components/editor/CodeEditor';
import OutputPanel from '../components/editor/OutputPanel';
import HistoryModal from '../components/modals/HistoryModal';
import ShareModal from '../components/modals/ShareModal';
import TemplatesModal from '../components/modals/TemplatesModal';
import SettingsModal from '../components/modals/SettingsModal';
import DownloadModal from '../components/modals/DownloadModal';
import { DEFAULT_SCRATCHPAD_FILES } from '../data/scratchpad';
import { X, AlertTriangle } from 'lucide-react';

// Small error toast for workspace-level errors
const WorkspaceError = ({ message, onClose }) => (
  <div className="fixed top-16 right-4 z-50 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 max-w-sm animate-fade-in">
    <AlertTriangle size={16} className="flex-shrink-0" />
    <span className="text-sm font-bold flex-1">{message}</span>
    <button onClick={onClose} className="p-0.5 hover:text-red-900"><X size={14} /></button>
  </div>
);

export const WorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, refreshUser } = useAuth();

  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'
  const [runStatus, setRunStatus] = useState('Ready'); // 'Ready', 'Running...', 'Preview Updated'
  const [isRunning, setIsRunning] = useState(false);
  const [outputData, setOutputData] = useState(null);
  const [wsError, setWsError] = useState('');

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const autosaveTimerRef = useRef(null);

  const showError = (msg) => {
    setWsError(msg);
    setTimeout(() => setWsError(''), 5000);
  };

  // Load project or scratchpad
  useEffect(() => {
    const initWorkspace = async () => {
      if (id && id !== 'new') {
        try {
          const res = await api.get(`/projects/${id}/`);
          setProject(res.data);
          const loadedFiles = res.data.files || [];
          setFiles(loadedFiles);
          if (loadedFiles.length > 0) {
            const mainFile = loadedFiles.find((f) => f.is_main) || loadedFiles[0];
            setActiveFileId(mainFile.id);
          }
        } catch (err) {
          navigate('/dashboard');
        }
      } else {
        // Scratchpad / New Project mode: 3 files (index.html, style.css, script.js)
        const initialFiles = DEFAULT_SCRATCHPAD_FILES.map((f, i) => ({
          ...f,
          id: `scratch_${i + 1}`,
        }));
        setProject({
          id: null,
          name: 'My Web Project',
          language: 'html',
        });
        setFiles(initialFiles);
        setActiveFileId(initialFiles[0].id);
      }
    };
    initWorkspace();
  }, [id, navigate]);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  // Save Project Implementation
  const saveProject = useCallback(
    async (createVersion = false, versionMessage = 'Saved changes') => {
      if (!project?.id) {
        // If scratchpad, prompt to save as new project if authenticated
        if (isAuthenticated) {
          try {
            setSaveStatus('saving');
            const res = await api.post('/projects/', {
              name: project?.name || 'My Web Project',
              language: project?.language || 'html',
              files: files.map((f) => ({
                filename: f.filename,
                language: f.language,
                content: f.content,
                is_main: f.is_main,
              })),
            });
            setProject(res.data);
            setFiles(res.data.files);
            setSaveStatus('saved');
            navigate(`/workspace/${res.data.id}`, { replace: true });
            return;
          } catch (err) {
            setSaveStatus('unsaved');
          }
        }
        setSaveStatus('saved');
        return;
      }

      setSaveStatus('saving');
      try {
        await api.post(`/projects/${project.id}/save/`, {
          files: files.map((f) => ({
            id: typeof f.id === 'number' ? f.id : undefined,
            filename: f.filename,
            language: f.language,
            content: f.content,
            is_main: f.is_main,
          })),
          create_version: createVersion,
          version_message: versionMessage,
        });
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('unsaved');
      }
    },
    [project, files, isAuthenticated, navigate]
  );

  // Debounced Autosave on content changes
  const handleContentChange = (fileId, newContent) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, content: newContent } : f))
    );
    setSaveStatus('unsaved');

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(() => {
      saveProject(false);
    }, 2500);
  };

  // Run Code: combines index.html, style.css, script.js and loads safely in sandboxed iframe
  const handleRun = async () => {
    setIsRunning(true);
    setRunStatus('Running...');

    // Auto-save changes
    saveProject(false);

    // Instant local browser execution in sandboxed iframe
    setTimeout(() => {
      setIsRunning(false);
      setRunStatus('Preview Updated');
      setOutputData({
        status: 'success',
        timestamp: Date.now(),
        message: 'Preview Updated',
      });

      // Notify backend to log activity and grant badges if authenticated
      if (isAuthenticated) {
        api.post('/execute/', {
          language: project?.language || 'html',
          project_id: project?.id,
        }).then(() => {
          if (refreshUser) refreshUser();
        }).catch(() => {});
      }

      // Reset run status badge to Ready after 3 seconds
      setTimeout(() => {
        setRunStatus('Ready');
      }, 3000);
    }, 250);
  };

  // Switch Language (HTML, CSS, JavaScript only)
  const handleLanguageChange = async (newLang) => {
    if (!newLang || !['html', 'css', 'javascript'].includes(newLang)) return;

    setProject((prev) => ({ ...prev, language: newLang }));

    if (project?.id) {
      try {
        await api.patch(`/projects/${project.id}/`, { language: newLang });
      } catch (e) {
        console.error('Failed to update project language:', e);
      }
    }

    // Switch active editor tab to matching file
    const targetFilename =
      newLang === 'html' ? 'index.html' : newLang === 'css' ? 'style.css' : 'script.js';
    const targetExt =
      newLang === 'html' ? '.html' : newLang === 'css' ? '.css' : '.js';

    const existingFile = files.find(
      (f) =>
        f.filename.toLowerCase() === targetFilename ||
        f.filename.toLowerCase().endsWith(targetExt)
    );

    if (existingFile) {
      setActiveFileId(existingFile.id);
    } else {
      // Create starter file for this web language if not yet created
      const starterStarters = {
        html: {
          filename: 'index.html',
          language: 'html',
          is_main: true,
          content: `<!DOCTYPE html>\n<html>\n<head>\n    <title>CodeBuddy</title>\n</head>\n<body>\n    <div class="card">\n        <h1>Hello CodeBuddy!</h1>\n        <p>Start building your first webpage.</p>\n        <button onclick="changeMessage()">Click Me</button>\n    </div>\n</body>\n</html>`,
        },
        css: {
          filename: 'style.css',
          language: 'css',
          is_main: false,
          content: `body {\n    margin: 0;\n    font-family: Arial, sans-serif;\n    background: linear-gradient(135deg, #fff8f0, #ffebf3);\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    min-height: 100vh;\n}\n\n.card {\n    background: white;\n    padding: 40px;\n    border-radius: 20px;\n    text-align: center;\n}\n\nh1 {\n    color: #a259ff;\n}\n\nbutton {\n    padding: 12px 20px;\n    border: none;\n    border-radius: 12px;\n    cursor: pointer;\n}`,
        },
        javascript: {
          filename: 'script.js',
          language: 'javascript',
          is_main: false,
          content: `function changeMessage() {\n    alert("Great job! You are coding!");\n}`,
        },
      };

      const starter = starterStarters[newLang];
      if (project?.id) {
        try {
          const res = await api.post(`/projects/${project.id}/files/`, starter);
          setFiles((prev) => [...prev, res.data]);
          setActiveFileId(res.data.id);
          return;
        } catch (err) {
          console.error('Failed to create file for new language:', err);
        }
      }
      const newFileObj = {
        id: `lang_${Date.now()}`,
        ...starter,
      };
      setFiles((prev) => [...prev, newFileObj]);
      setActiveFileId(newFileObj.id);
      setSaveStatus('unsaved');
    }
  };

  // Rename Project
  const handleRenameProject = async (newName) => {
    setProject((prev) => ({ ...prev, name: newName }));
    if (project?.id) {
      try {
        await api.patch(`/projects/${project.id}/`, { name: newName });
      } catch (err) {
        console.error('Failed to rename project:', err);
      }
    }
  };

  // File Operations
  const handleCreateFile = async (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const lang = ext === 'html' ? 'html' : ext === 'css' ? 'css' : 'javascript';
    const newFile = {
      id: `temp_${Date.now()}`,
      filename,
      language: lang,
      content: '',
      is_main: false,
    };

    if (project?.id) {
      try {
        const res = await api.post(`/projects/${project.id}/files/`, {
          filename,
          language: lang,
          content: '',
        });
        setFiles((prev) => [...prev, res.data]);
        setActiveFileId(res.data.id);
        return;
      } catch (err) {
        showError(err.response?.data?.error || 'Failed to create file.');
        return;
      }
    }

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setSaveStatus('unsaved');
  };

  const handleRenameFile = async (fileId, newFilename) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, filename: newFilename } : f))
    );
    if (project?.id && typeof fileId === 'number') {
      try {
        await api.patch(`/projects/files/${fileId}/`, { filename: newFilename });
      } catch {
        showError('Failed to rename file.');
      }
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (files.length <= 1) {
      showError('Cannot delete the last remaining file.');
      return;
    }
    if (!window.confirm('Delete this file? This cannot be undone.')) return;

    if (project?.id && typeof fileId === 'number') {
      try {
        await api.delete(`/projects/files/${fileId}/`);
      } catch {
        showError('Failed to delete file.');
        return;
      }
    }

    const remaining = files.filter((f) => f.id !== fileId);
    setFiles(remaining);
    if (activeFileId === fileId) {
      setActiveFileId(remaining[0].id);
    }
  };

  const handleDuplicateFile = (fileId) => {
    const target = files.find((f) => f.id === fileId);
    if (!target) return;
    const parts = target.filename.split('.');
    const ext = parts.pop();
    const base = parts.join('.');
    const cloneName = `${base}_copy.${ext}`;
    handleCreateFile(cloneName);
  };

  // Beautify / Format Code
  const handleBeautify = () => {
    if (!activeFile) return;
    try {
      let formatted = activeFile.content;
      if (activeFile.filename.endsWith('.json')) {
        formatted = JSON.stringify(JSON.parse(activeFile.content), null, 2);
      }
      handleContentChange(activeFile.id, formatted);
    } catch (e) {
      console.warn('Formatting skipped:', e);
    }
  };

  // Load Template
  const handleLoadTemplate = async (template) => {
    const newFiles = template.files.map((f, i) => ({
      ...f,
      id: project?.id ? undefined : `scratch_${i + 1}`,
    }));

    if (project?.id) {
      try {
        const res = await api.post(`/projects/${project.id}/save/`, {
          files: newFiles,
          create_version: true,
          version_message: `Loaded ${template.title} template`,
        });
        setFiles(res.data.project.files);
        setActiveFileId(res.data.project.files[0]?.id);
      } catch (err) {
        alert('Failed to load template into project');
      }
    } else {
      setProject((prev) => ({
        ...prev,
        name: template.title,
        language: template.language || 'html',
      }));
      setFiles(newFiles);
      setActiveFileId(newFiles[0]?.id);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#182033] overflow-hidden">
      {wsError && <WorkspaceError message={wsError} onClose={() => setWsError('')} />}

      {/* Top IDE Toolbar */}
      <TopToolbar
        projectName={project?.name || 'My Web Project'}
        onRenameProject={handleRenameProject}
        saveStatus={saveStatus}
        runStatus={runStatus}
        onSave={() => saveProject(true, 'Manual save')}
        onRun={handleRun}
        isRunning={isRunning}
        onBeautify={handleBeautify}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenDownload={() => setIsDownloadOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDebug={() => setOutputData({ timestamp: Date.now() })}
        language={project?.language || 'html'}
        onLanguageChange={handleLanguageChange}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left File Explorer */}
        <FileExplorer
          files={files}
          activeFileId={activeFileId}
          onSelectFile={(fid) => setActiveFileId(fid)}
          onCreateFile={handleCreateFile}
          onRenameFile={handleRenameFile}
          onDeleteFile={handleDeleteFile}
          onDuplicateFile={handleDuplicateFile}
          projectName={project?.name || 'Web Project'}
        />

        {/* Center: Monaco Editor & Output Split */}
        <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
          {/* Left/Top: Editor with file tabs (index.html | style.css | script.js) */}
          <div className="flex-1 h-full flex flex-col border-r border-[#334155]">
            <CodeEditor
              file={activeFile}
              files={files}
              onSelectFile={(fid) => setActiveFileId(fid)}
              onChange={handleContentChange}
              onRun={handleRun}
              onSave={() => saveProject(true, 'Manual save')}
            />
          </div>

          {/* Right/Bottom: Live Preview & Console Panel */}
          <div className="w-full md:w-[48%] h-full flex flex-col">
            <OutputPanel
              language={project?.language || 'html'}
              files={files}
              outputData={outputData}
              isRunning={isRunning}
              onRun={handleRun}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        projectId={project?.id}
        onRestoreVersion={(updatedProj) => {
          setProject(updatedProj);
          setFiles(updatedProj.files);
          if (updatedProj.files?.length > 0) {
            setActiveFileId(updatedProj.files[0].id);
          }
        }}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        projectId={project?.id}
        projectName={project?.name || 'Project'}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onLoadTemplate={handleLoadTemplate}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        projectName={project?.name || 'MyWebProject'}
        files={files}
        activeFile={activeFile}
      />
    </div>
  );
};

export default WorkspacePage;
