import JSZip from 'jszip';

export const downloadSingleFile = (file) => {
  const blob = new Blob([file.content || ''], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadProjectZip = async (projectName, files) => {
  const zip = new JSZip();

  files.forEach((file) => {
    zip.file(file.filename, file.content || '');
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  a.download = `${safeName || 'codebuddy_project'}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
