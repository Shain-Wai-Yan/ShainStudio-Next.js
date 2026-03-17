'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface RepoFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  download_url?: string;
}

interface RepoViewerProps {
  repoName: string;
  defaultBranch?: string;
  onClose: () => void;
}

const BINARY_EXTS = new Set([
  '.png','.jpg','.jpeg','.gif','.bmp','.ico','.pdf','.zip','.rar','.tar',
  '.gz','.7z','.exe','.dll','.so','.ttf','.otf','.woff','.woff2',
  '.mp3','.mp4','.avi','.mov','.psd','.ai','.sketch','.webp',
]);
const IMAGE_EXTS = new Set(['.png','.jpg','.jpeg','.gif','.bmp','.ico','.svg','.webp']);

function getExt(name: string) {
  const parts = name.split('.');
  return parts.length > 1 ? '.' + parts.pop()!.toLowerCase() : '';
}
const isBinary = (n: string) => BINARY_EXTS.has(getExt(n));
const isImage  = (n: string) => IMAGE_EXTS.has(getExt(n));
const isMD     = (n: string) => ['.md', '.markdown'].includes(getExt(n));

function getLang(name: string) {
  const map: Record<string, string> = {
    js:'javascript', jsx:'javascript', ts:'typescript', tsx:'typescript',
    py:'python', rb:'ruby', java:'java', c:'c', cpp:'cpp', cs:'csharp',
    go:'go', php:'php', swift:'swift', kt:'kotlin', rs:'rust',
    sh:'bash', bash:'bash', sql:'sql', json:'json', xml:'xml',
    yaml:'yaml', yml:'yaml', toml:'toml', html:'html', css:'css',
    scss:'scss', sass:'sass', md:'markdown', mdx:'markdown',
  };
  return map[name.split('.').pop()?.toLowerCase() || ''] || 'plaintext';
}

function escapeHtml(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/** Properly decode GitHub's base64 — preserves UTF-8 emojis & CJK */
function decodeBase64UTF8(b64: string): string {
  try {
    const cleaned = b64.replace(/\n/g, '');
    const binary  = atob(cleaned);
    const bytes   = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return atob(b64.replace(/\n/g, ''));
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      const check = () => { if ((window as any).marked) resolve(); else setTimeout(check, 50); };
      check(); return;
    }
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = () => resolve(); s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

function loadLink(href: string) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href;
    document.head.appendChild(l);
  }
}

function FolderIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400 flex-shrink-0">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function FileIconSmall() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}

export function RepoViewer({ repoName, defaultBranch = 'main', onClose }: RepoViewerProps) {
  const [files, setFiles]               = useState<RepoFile[]>([]);
  const [currentPath, setCurrentPath]   = useState('');
  const [branch]                        = useState(defaultBranch);
  const [selectedFile, setSelectedFile] = useState<RepoFile | null>(null);
  const [renderedHTML, setRenderedHTML] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [fileError, setFileError]       = useState<string | null>(null);
  const [dirError, setDirError]         = useState<string | null>(null);
  const [isDark, setIsDark]             = useState(false);
  const contentRef                      = useRef<HTMLDivElement>(null);

  // Detect dark mode reactively
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Load CDN libs once
  useEffect(() => {
    loadLink('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css');
    Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js'),
    ]).catch(() => {});
  }, []);

  // ── Load directory ────────────────────────────────────────────────────────
  const fetchDir = useCallback(async (path: string) => {
    setLoadingFiles(true); setDirError(null);
    try {
      const p = new URLSearchParams({ username: 'Shain-Wai-Yan', type: 'contents', repo: repoName, path, branch });
      const res = await fetch(`/api/github?${p}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw   = await res.json();
      const items: RepoFile[] = Array.isArray(raw) ? raw : [raw];
      const sorted = [...items].sort((a, b) => {
        if (a.type === 'dir' && b.type !== 'dir') return -1;
        if (a.type !== 'dir' && b.type === 'dir') return 1;
        return a.name.localeCompare(b.name);
      });
      setFiles(sorted);
      if (path === '') {
        const readme = sorted.find(f => f.type === 'file' && f.name.toLowerCase() === 'readme.md');
        if (readme) openFile(readme);
      }
    } catch (e) {
      setDirError(`Could not load files: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setLoadingFiles(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoName, branch]);

  useEffect(() => { fetchDir(''); }, [fetchDir]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // ── Open a file ───────────────────────────────────────────────────────────
  const openFile = async (file: RepoFile) => {
    setSelectedFile(file); setRenderedHTML(''); setFileError(null);
    if (isBinary(file.name)) return;
    setLoadingContent(true);
    try {
      const p = new URLSearchParams({ username: 'Shain-Wai-Yan', type: 'file', repo: repoName, path: file.path, branch });
      const res = await fetch(`/api/github?${p}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const text = data.content ? decodeBase64UTF8(data.content) : '';
      if (isMD(file.name)) {
        await renderMarkdown(text);
      } else {
        renderCode(text, file.name);
      }
    } catch (e) {
      setFileError(`Could not load: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setLoadingContent(false);
    }
  };

  const renderMarkdown = async (text: string) => {
    const win = window as any;
    if (!win.marked) {
      try { await loadScript('https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js'); } catch {}
    }
    if (win.marked) {
      win.marked.use({ gfm: true, breaks: true });
      const html: string = await win.marked.parse(text);
      setRenderedHTML(html);
      setTimeout(() => {
        if (win.hljs && contentRef.current) {
          contentRef.current.querySelectorAll('pre code').forEach((block: any) => {
            if (!block.dataset.highlighted) win.hljs.highlightElement(block);
          });
        }
      }, 80);
    } else {
      setRenderedHTML(basicMarkdown(text, isDark));
    }
  };

  const renderCode = (text: string, filename: string) => {
    const win = window as any;
    if (win.hljs) {
      try {
        const result = win.hljs.highlight(text, { language: getLang(filename), ignoreIllegals: true });
        setRenderedHTML(result.value); return;
      } catch {}
    }
    setRenderedHTML(escapeHtml(text));
  };

  // ── Navigate directory ────────────────────────────────────────────────────
  const navigateTo = (path: string) => {
    setCurrentPath(path); setSelectedFile(null); setRenderedHTML(''); fetchDir(path);
  };

  const breadcrumbs = currentPath ? currentPath.split('/') : [];

  // Colours derived from dark mode state
  const headingColor  = isDark ? '#d4af37' : '#191970';
  const btnBg         = isDark ? '#a67c00' : '#191970';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ backgroundColor: 'rgba(10,10,20,0.8)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="flex flex-col w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl
          bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-700"
        style={{ height: 'min(90vh, 820px)' }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ backgroundColor: btnBg }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="flex-shrink-0 opacity-80">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{repoName}</p>
              <p className="text-white/60 text-xs">branch: {branch}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={`https://github.com/Shain-Wai-Yan/${repoName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-white/70 hover:text-white text-xs
                px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/50 transition-colors"
            >
              Open on GitHub
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
            <button onClick={onClose}
              className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Sidebar ── */}
          <div className="w-56 sm:w-64 border-r border-gray-200 dark:border-gray-700
            flex flex-col bg-gray-50 dark:bg-[#141414] flex-shrink-0">

            {/* Breadcrumb */}
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700
              flex items-center flex-wrap gap-0.5 text-xs min-h-[34px]">
              <button onClick={() => navigateTo('')}
                className="font-semibold truncate max-w-[90px] hover:underline"
                style={{ color: headingColor }}
                title={repoName}>{repoName}</button>
              {breadcrumbs.map((seg, i) => {
                const segPath = breadcrumbs.slice(0, i + 1).join('/');
                const isLast  = i === breadcrumbs.length - 1;
                return (
                  <span key={`bc-${i}`} className="flex items-center gap-0.5">
                    <span className="text-gray-400 dark:text-gray-600 mx-0.5">/</span>
                    {isLast ? (
                      <span className="text-gray-600 dark:text-gray-400 truncate max-w-[80px]" title={seg}>{seg}</span>
                    ) : (
                      <button onClick={() => navigateTo(segPath)}
                        className="hover:underline truncate max-w-[80px]"
                        style={{ color: headingColor }}
                        title={seg}>{seg}</button>
                    )}
                  </span>
                );
              })}
            </div>

            {/* Back */}
            {currentPath && (
              <button
                onClick={() => {
                  const parent = currentPath.includes('/') ? currentPath.split('/').slice(0, -1).join('/') : '';
                  navigateTo(parent);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs
                  text-gray-500 dark:text-gray-400
                  hover:bg-gray-100 dark:hover:bg-[#1e1e1e]
                  border-b border-gray-100 dark:border-gray-700 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back
              </button>
            )}

            {/* File list */}
            <div className="flex-1 overflow-y-auto">
              {loadingFiles ? (
                <div className="p-3 space-y-2">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
                  ))}
                </div>
              ) : dirError ? (
                <div className="p-4 text-xs text-red-500 dark:text-red-400 leading-relaxed">{dirError}</div>
              ) : (
                files.map((file, i) => (
                  <button
                    key={`${file.path}-${i}`}
                    onClick={() => file.type === 'dir' ? navigateTo(file.path) : openFile(file)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left
                      border-b border-gray-50 dark:border-gray-800 transition-colors
                      ${selectedFile?.path === file.path
                        ? 'bg-indigo-50 dark:bg-[#1e1e2e] font-semibold'
                        : 'hover:bg-gray-100 dark:hover:bg-[#1e1e1e] text-gray-700 dark:text-gray-300'
                      }`}
                    style={selectedFile?.path === file.path ? { color: headingColor } : {}}
                  >
                    {file.type === 'dir' ? <FolderIcon /> : <FileIconSmall />}
                    <span className="truncate flex-1" title={file.name}>{file.name}</span>
                    {file.type === 'dir' && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className="text-gray-300 dark:text-gray-600 flex-shrink-0">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Main pane ── */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#1a1a1a]">
            {selectedFile ? (
              <>
                {/* File header bar */}
                <div className="flex items-center justify-between px-4 py-2
                  border-b border-gray-200 dark:border-gray-700
                  bg-gray-50 dark:bg-[#141414] flex-shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileIconSmall />
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">
                      {selectedFile.path}
                    </span>
                  </div>
                  {selectedFile.download_url && (
                    <a href={selectedFile.download_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs flex-shrink-0 ml-2 hover:underline"
                      style={{ color: headingColor }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Raw
                    </a>
                  )}
                </div>

                {/* Content area */}
                <div className="flex-1 overflow-auto" ref={contentRef}>
                  {loadingContent ? (
                    <div className="p-6 space-y-3">
                      {[80,65,90,55,75,60,85,50,70].map((w, i) => (
                        <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"
                          style={{ width: `${w}%` }}/>
                      ))}
                    </div>
                  ) : fileError ? (
                    <div className="p-6 text-sm text-red-500 dark:text-red-400">{fileError}</div>
                  ) : isBinary(selectedFile.name) ? (
                    isImage(selectedFile.name) ? (
                      <div className="flex items-center justify-center p-8">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selectedFile.download_url} alt={selectedFile.name}
                          className="max-w-full max-h-[70vh] rounded-lg shadow"/>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 p-8">
                        <div className="text-5xl">📦</div>
                        <p className="text-sm text-center">Binary file — cannot be previewed.</p>
                        {selectedFile.download_url && (
                          <a href={selectedFile.download_url} target="_blank" rel="noopener noreferrer"
                            className="text-sm px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: btnBg }}>
                            Download File
                          </a>
                        )}
                      </div>
                    )
                  ) : isMD(selectedFile.name) ? (
                    /* ── Markdown ── */
                    <div
                      ref={contentRef}
                      className="rv-markdown p-6 max-w-3xl"
                      dangerouslySetInnerHTML={{ __html: renderedHTML }}
                    />
                  ) : (
                    /* ── Code ── */
                    <pre className="p-4 m-0 text-xs font-mono leading-relaxed overflow-auto
                      bg-white dark:bg-[#1a1a1a] h-full" style={{ tabSize: 2 }}>
                      <code
                        className={`hljs language-${getLang(selectedFile.name)}`}
                        dangerouslySetInnerHTML={{ __html: renderedHTML }}
                      />
                    </pre>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4
                text-gray-300 dark:text-gray-600">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p className="text-sm text-gray-400 dark:text-gray-500">Select a file to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Markdown styles ──
          Uses @media (prefers-color-scheme: dark) so it works regardless of
          where the .dark class lives in the DOM tree.
      */}
      <style>{`
        /* ── Light mode base ── */
        .rv-markdown {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 14px;
          line-height: 1.7;
          color: #24292e;
        }
        .rv-markdown h1 { font-size:1.75em; font-weight:700; margin:1.2em 0 .6em; padding-bottom:.3em; border-bottom:1px solid #e1e4e8; color:#191970; }
        .rv-markdown h2 { font-size:1.35em; font-weight:700; margin:1.2em 0 .5em; padding-bottom:.25em; border-bottom:1px solid #eaecef; color:#191970; }
        .rv-markdown h3 { font-size:1.1em; font-weight:600; margin:1em 0 .4em; color:#24292e; }
        .rv-markdown h4, .rv-markdown h5, .rv-markdown h6 { font-size:.95em; font-weight:600; margin:.8em 0 .4em; color:#24292e; }
        .rv-markdown p  { margin:0 0 1em; color:#24292e; }
        .rv-markdown ul, .rv-markdown ol { padding-left:1.8em; margin:0 0 1em; }
        .rv-markdown li { margin:.25em 0; line-height:1.6; color:#24292e; }
        .rv-markdown a  { color:#0366d6; text-decoration:none; }
        .rv-markdown a:hover { text-decoration:underline; }
        .rv-markdown strong { font-weight:600; }
        .rv-markdown em { font-style:italic; }
        .rv-markdown hr { border:none; border-top:1px solid #e1e4e8; margin:1.5em 0; }
        .rv-markdown blockquote { margin:0 0 1em; padding:.5em 1em; color:#6a737d; border-left:4px solid #dfe2e5; }
        .rv-markdown blockquote p { margin:0; color:#6a737d; }
        .rv-markdown code { font-family:"SFMono-Regular",Consolas,monospace; font-size:.85em; background:rgba(27,31,35,.07); padding:.2em .45em; border-radius:3px; color:#e36209; }
        .rv-markdown pre { background:#f6f8fa; border-radius:6px; padding:1em; overflow-x:auto; margin:0 0 1em; line-height:1.5; }
        .rv-markdown pre code { background:transparent; padding:0; font-size:.8em; color:inherit; }
        .rv-markdown table { border-collapse:collapse; width:100%; margin:0 0 1em; display:block; overflow-x:auto; }
        .rv-markdown th, .rv-markdown td { border:1px solid #dfe2e5; padding:.4em .8em; color:#24292e; }
        .rv-markdown th { background:#f6f8fa; font-weight:600; }
        .rv-markdown tr:nth-child(even) td { background:#f6f8fa; }
        .rv-markdown img { max-width:100%; border-radius:4px; }

        /* ── Dark mode overrides — uses media query so it works in any DOM position ── */
        @media (prefers-color-scheme: dark) {
          .rv-markdown { color: #e0e0e0; }
          .rv-markdown h1 { color:#d4af37; border-bottom-color:#333; }
          .rv-markdown h2 { color:#d4af37; border-bottom-color:#333; }
          .rv-markdown h3, .rv-markdown h4, .rv-markdown h5, .rv-markdown h6 { color:#e0e0e0; }
          .rv-markdown p  { color:#e0e0e0; }
          .rv-markdown li { color:#e0e0e0; }
          .rv-markdown a  { color:#d4af37; }
          .rv-markdown hr { border-top-color:#444; }
          .rv-markdown blockquote { color:#9ca3af; border-left-color:#444; }
          .rv-markdown blockquote p { color:#9ca3af; }
          .rv-markdown code { background:rgba(255,255,255,.1); color:#f1a040; }
          .rv-markdown pre { background:#1e1e1e; }
          .rv-markdown pre code { color:inherit; }
          .rv-markdown th, .rv-markdown td { border-color:#444; color:#e0e0e0; }
          .rv-markdown th { background:#252525; }
          .rv-markdown tr:nth-child(even) td { background:#1e1e1e; }
        }
      `}</style>
    </div>
  );
}

// ── Fallback markdown renderer (no deps) ─────────────────────────────────────
function basicMarkdown(md: string, dark: boolean): string {
  if (!md) return '';

  const bodyColor    = dark ? '#e0e0e0'  : '#24292e';
  const headingColor = dark ? '#d4af37'  : '#191970';
  const mutedColor   = dark ? '#9ca3af'  : '#6a737d';
  const linkColor    = dark ? '#d4af37'  : '#0366d6';
  const codeBg       = dark ? 'rgba(255,255,255,.1)' : 'rgba(27,31,35,.07)';
  const preBg        = dark ? '#1e1e1e'  : '#f6f8fa';
  const hrColor      = dark ? '#444'     : '#e1e4e8';
  const borderColor  = dark ? '#444'     : '#dfe2e5';

  const inline = (s: string) =>
    s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, `<img src="$2" alt="$1" style="max-width:100%;border-radius:4px"/>`)
     .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer" style="color:${linkColor}">$1</a>`)
     .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
     .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
     .replace(/\*(.+?)\*/g, '<em>$1</em>')
     .replace(/`([^`]+)`/g, `<code style="background:${codeBg};padding:.2em .45em;border-radius:3px;font-size:.85em;font-family:monospace">$1</code>`);

  const escHtml = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const lines = md.split('\n');
  const out: string[] = [];
  let inCode = false; let codeLang = ''; let codeLines: string[] = [];
  let listLines: string[] = [];

  const flushList = () => {
    if (listLines.length) {
      out.push(`<ul style="padding-left:1.8em;margin:0 0 1em;color:${bodyColor}">${
        listLines.map(l => `<li style="margin:.25em 0;line-height:1.6">${l}</li>`).join('')
      }</ul>`);
      listLines = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (!inCode) { inCode = true; codeLang = line.slice(3).trim() || 'text'; codeLines = []; }
      else {
        inCode = false;
        out.push(`<pre style="background:${preBg};border-radius:6px;padding:1em;overflow-x:auto;margin:0 0 1em;font-size:.8em;line-height:1.5"><code class="language-${codeLang}">${escHtml(codeLines.join('\n'))}</code></pre>`);
        codeLines = [];
      }
      continue;
    }
    if (inCode) { codeLines.push(line); continue; }
    if (!line.trim()) { flushList(); out.push('<br/>'); continue; }

    const hm = line.match(/^(#{1,6})\s+(.+)$/);
    if (hm) {
      flushList();
      const level = hm[1].length;
      const sizes = ['1.75em','1.35em','1.1em','.95em','.9em','.85em'];
      const border = level <= 2 ? `border-bottom:1px solid ${hrColor};padding-bottom:.25em;` : '';
      out.push(`<h${level} style="font-size:${sizes[level-1]};font-weight:700;margin:1.2em 0 .5em;color:${headingColor};${border}">${inline(hm[2])}</h${level}>`);
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      flushList();
      out.push(`<hr style="border:none;border-top:1px solid ${hrColor};margin:1.5em 0"/>`);
      continue;
    }
    if (line.startsWith('> ')) {
      flushList();
      out.push(`<blockquote style="margin:0 0 1em;padding:.5em 1em;color:${mutedColor};border-left:4px solid ${borderColor}">${inline(line.slice(2))}</blockquote>`);
      continue;
    }
    if (/^\s*[-*+] /.test(line)) { listLines.push(inline(line.replace(/^\s*[-*+] /,''))); continue; }
    if (/^\s*\d+\. /.test(line)) { listLines.push(inline(line.replace(/^\s*\d+\. /,''))); continue; }

    flushList();
    out.push(`<p style="margin:0 0 .75em;line-height:1.7;color:${bodyColor}">${inline(line)}</p>`);
  }
  flushList();
  return out.join('\n');
}