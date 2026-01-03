import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useBlog } from '../../BlogContext';
import { aiAutoFormat } from '../../utils/aiFormat';
import { supabase } from '../../supabaseClient';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';

const CATEGORIES = ['ECOSYSTEM', 'STARTUP', 'JOURNEY', 'TECH', 'PERSONAL', 'INSIGHTS', 'PHILOSOPHY'];

const BlogSection = () => {
  const { posts, createPost, updatePost, deletePost, togglePublish } = useBlog();
  const [view, setView] = useState('list');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [formatError, setFormatError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [savedDraft, setSavedDraft] = useState(null);
  const fileInputRef = useRef(null);
  const editorContainerRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'ECOSYSTEM',
    published: false,
    featured: false,
    visibility: 'public',
    password: '',
    slug: '',
    meta_description: '',
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');

  // API Settings state
  const [apiSettings, setApiSettings] = useState({
    anthropicKey: '',
    openaiKey: '',
    preferredProvider: 'anthropic',
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const theme = {
    bg: '#0a0a0a',
    surface: '#141414',
    border: 'rgba(255,255,255,0.1)',
    text: '#ffffff',
    textMuted: '#888888',
    accent: '#C4785A',
    teal: '#4ECDC4',
    danger: '#FF6B6B',
    yellow: '#FFE66D',
    purple: '#9b59b6',
    blue: '#3498db',
  };

  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          style: 'max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          style: 'color: #C4785A; text-decoration: underline;',
        },
      }),
      Placeholder.configure({
        placeholder: 'Write your blog post content here...',
      }),
      Youtube.configure({
        width: '100%',
        height: 400,
        HTMLAttributes: {
          style: 'border-radius: 8px; margin: 16px 0;',
        },
      }),
    ],
    content: formData.content || '',
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, content: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        style: `
          min-height: ${isFullscreen ? 'calc(100vh - 400px)' : '400px'};
          padding: 16px;
          outline: none;
          color: #ffffff;
          font-family: 'Source Serif 4', serif;
          font-size: 15px;
          line-height: 1.7;
        `,
      },
    },
  });

  // Update editor content when editing a post
  useEffect(() => {
    if (editor && selectedPost && view === 'edit') {
      editor.commands.setContent(formData.content || '');
    }
  }, [selectedPost, view]);

  // Word count & reading time calculation
  const getPlainText = (html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };
  const plainText = getPlainText(formData.content);
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);
  const charCount = plainText.length;

  // Auto-generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Load API settings
  useEffect(() => {
    const localSettings = localStorage.getItem('blog_api_settings');
    if (localSettings) {
      try {
        setApiSettings(JSON.parse(localSettings));
      } catch (e) {
        console.log('Invalid localStorage settings');
      }
    }
  }, []);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (view !== 'create' && view !== 'edit') return;
    if (!formData.content && !formData.title) return;

    const autoSaveTimer = setInterval(() => {
      const draftData = {
        ...formData,
        savedAt: new Date().toISOString(),
        isEdit: view === 'edit',
        postId: selectedPost?.id,
      };
      localStorage.setItem('blog_draft', JSON.stringify(draftData));
      setLastSaved(new Date());
    }, 30000);

    return () => clearInterval(autoSaveTimer);
  }, [formData, view, selectedPost]);

  // Check for unsaved draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('blog_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        const savedAt = new Date(parsed.savedAt);
        const now = new Date();
        const hoursSinceSave = (now - savedAt) / (1000 * 60 * 60);

        // Only show draft if less than 24 hours old
        if (hoursSinceSave < 24) {
          setSavedDraft(parsed);
          setShowDraftModal(true);
        } else {
          localStorage.removeItem('blog_draft');
        }
      } catch (e) {
        localStorage.removeItem('blog_draft');
      }
    }
  }, []);

  // Keyboard shortcuts (TipTap handles Cmd+B/I automatically)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (view !== 'create' && view !== 'edit') return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.key === 's') {
        e.preventDefault();
        // Manual save to localStorage
        const draftData = { ...formData, savedAt: new Date().toISOString() };
        localStorage.setItem('blog_draft', JSON.stringify(draftData));
        setLastSaved(new Date());
      } else if (modKey && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      } else if (modKey && e.key === 'Enter') {
        e.preventDefault();
        if (formData.title && formData.content) {
          document.querySelector('form')?.requestSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, formData, isFullscreen]);

  // Save API settings
  const saveApiSettings = () => {
    localStorage.setItem('blog_api_settings', JSON.stringify(apiSettings));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  // Insert image using TipTap
  const insertImage = (url, alt = 'Image') => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: url, alt }).run();
  };

  // Insert embed (YouTube, etc.) using TipTap
  const insertEmbed = (type) => {
    if (!editor) return;

    if (type === 'youtube') {
      const url = prompt('Enter YouTube video URL:');
      if (!url) return;

      // TipTap YouTube extension handles URL parsing
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  // Handle file upload (shared logic)
  const uploadFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      setFormatError('Only image files are allowed');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      insertImage(publicUrl, file.name.split('.')[0]);
    } catch (error) {
      console.error('Upload error:', error);
      setFormatError('Failed to upload image. Create a "resources" bucket in Supabase Storage first.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image upload via file input
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        await uploadFile(file);
      }
    }
  };

  // Insert image URL
  const handleImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const alt = prompt('Enter image description (alt text):', 'Image') || 'Image';
      insertImage(url, alt);
    }
  };

  // AI Auto-format handler
  const handleAIFormat = async () => {
    if (!formData.content.trim()) {
      setFormatError('No content to format');
      return;
    }

    if (!apiSettings.anthropicKey && !apiSettings.openaiKey) {
      setFormatError('Configure API keys in Settings first');
      setShowSettings(true);
      return;
    }

    setIsFormatting(true);
    setFormatError(null);

    try {
      const formatted = await aiAutoFormat(formData.content, apiSettings);
      setFormData({ ...formData, content: formatted });
      // Update TipTap editor with formatted content
      if (editor) {
        editor.commands.setContent(formatted);
      }
    } catch (err) {
      setFormatError(err.message);
    } finally {
      setIsFormatting(false);
    }
  };

  // AI Generate Excerpt
  const handleGenerateExcerpt = async () => {
    if (!formData.content.trim()) {
      setFormatError('No content to summarize');
      return;
    }

    if (!apiSettings.anthropicKey && !apiSettings.openaiKey) {
      setFormatError('Configure API keys in Settings first');
      setShowSettings(true);
      return;
    }

    setIsFormatting(true);
    setFormatError(null);

    try {
      const apiKey = apiSettings.preferredProvider === 'anthropic'
        ? apiSettings.anthropicKey
        : apiSettings.openaiKey;

      if (apiSettings.preferredProvider === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 150,
            messages: [{
              role: 'user',
              content: `Write a compelling 1-2 sentence excerpt/summary for this blog post. Keep it under 160 characters:\n\n${formData.content.substring(0, 2000)}`
            }]
          })
        });

        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        setFormData({ ...formData, excerpt: data.content[0].text.trim() });
      } else {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            max_tokens: 150,
            messages: [{
              role: 'user',
              content: `Write a compelling 1-2 sentence excerpt/summary for this blog post. Keep it under 160 characters:\n\n${formData.content.substring(0, 2000)}`
            }]
          })
        });

        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        setFormData({ ...formData, excerpt: data.choices[0].message.content.trim() });
      }
    } catch (err) {
      setFormatError('Failed to generate excerpt: ' + err.message);
    } finally {
      setIsFormatting(false);
    }
  };

  // Tag management
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const handleEdit = (post) => {
    setFormData({
      ...post,
      visibility: post.visibility || 'public',
      password: post.password || '',
      slug: post.slug || generateSlug(post.title),
      meta_description: post.meta_description || '',
      tags: post.tags || [],
    });
    if (editor) {
      editor.commands.setContent(post.content || '');
    }
    setSelectedPost(post);
    setView('edit');
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'ECOSYSTEM',
      published: false,
      featured: false,
      visibility: 'public',
      password: '',
      slug: '',
      meta_description: '',
      tags: [],
    });
    if (editor) {
      editor.commands.setContent('');
    }
    setSelectedPost(null);
    setView('create');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const postData = {
      ...formData,
      slug: formData.slug || generateSlug(formData.title),
    };

    if (view === 'create') {
      createPost(postData);
    } else {
      updatePost(selectedPost.id, postData);
    }

    // Clear draft after successful save
    localStorage.removeItem('blog_draft');
    setView('list');
  };

  const handleDelete = (id) => {
    deletePost(id);
    setShowDeleteConfirm(null);
  };

  const recoverDraft = () => {
    if (savedDraft) {
      setFormData({
        title: savedDraft.title || '',
        excerpt: savedDraft.excerpt || '',
        content: savedDraft.content || '',
        category: savedDraft.category || 'ECOSYSTEM',
        published: savedDraft.published || false,
        featured: savedDraft.featured || false,
        visibility: savedDraft.visibility || 'public',
        password: savedDraft.password || '',
        slug: savedDraft.slug || '',
        meta_description: savedDraft.meta_description || '',
        tags: savedDraft.tags || [],
      });
      if (editor) {
        editor.commands.setContent(savedDraft.content || '');
      }
      setView(savedDraft.isEdit ? 'edit' : 'create');
      if (savedDraft.isEdit && savedDraft.postId) {
        const post = posts.find(p => p.id === savedDraft.postId);
        if (post) setSelectedPost(post);
      }
    }
    setShowDraftModal(false);
  };

  const discardDraft = () => {
    localStorage.removeItem('blog_draft');
    setShowDraftModal(false);
    setSavedDraft(null);
  };

  // Toolbar button style (defined before FormattingToolbar)
  const toolbarBtnStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    color: theme.textMuted,
    padding: '6px 10px',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: '11px',
    transition: 'all 0.2s ease',
  };

  // Formatting Toolbar Component
  const FormattingToolbar = () => {
    if (!editor) return null;

    const isActive = (type, options = {}) => editor.isActive(type, options);

    const activeStyle = {
      ...toolbarBtnStyle,
      background: theme.accent,
      color: '#fff',
      borderColor: theme.accent,
    };

    return (
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '12px',
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderBottom: 'none',
        borderRadius: '8px 8px 0 0',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {/* Headers */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          style={isActive('heading', { level: 1 }) ? activeStyle : toolbarBtnStyle}
          title="Heading 1"
        >H1</button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          style={isActive('heading', { level: 2 }) ? activeStyle : toolbarBtnStyle}
          title="Heading 2"
        >H2</button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          style={isActive('heading', { level: 3 }) ? activeStyle : toolbarBtnStyle}
          title="Heading 3"
        >H3</button>

        <span style={{ width: '1px', height: '24px', background: theme.border, margin: '0 8px' }} />

        {/* Text formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={isActive('bold') ? activeStyle : toolbarBtnStyle}
          title="Bold (Cmd+B)"
        ><strong>B</strong></button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={isActive('italic') ? activeStyle : toolbarBtnStyle}
          title="Italic (Cmd+I)"
        ><em>I</em></button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          style={isActive('code') ? activeStyle : toolbarBtnStyle}
          title="Code"
        >{'</>'}</button>
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          style={isActive('link') ? activeStyle : toolbarBtnStyle}
          title="Link"
        >Link</button>

        <span style={{ width: '1px', height: '24px', background: theme.border, margin: '0 8px' }} />

        {/* Lists & quotes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={isActive('bulletList') ? activeStyle : toolbarBtnStyle}
          title="Bullet List"
        >•</button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={isActive('orderedList') ? activeStyle : toolbarBtnStyle}
          title="Numbered List"
        >1.</button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          style={isActive('blockquote') ? activeStyle : toolbarBtnStyle}
          title="Quote"
        >"</button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          style={toolbarBtnStyle}
          title="Divider"
        >—</button>

        <span style={{ width: '1px', height: '24px', background: theme.border, margin: '0 8px' }} />

        {/* Media */}
        <button type="button" onClick={() => fileInputRef.current?.click()} style={toolbarBtnStyle} title="Upload Image" disabled={isUploading}>
          {isUploading ? '...' : 'Img'}
        </button>
        <button type="button" onClick={handleImageUrl} style={toolbarBtnStyle} title="Image URL">URL</button>
        <button type="button" onClick={() => insertEmbed('youtube')} style={toolbarBtnStyle} title="YouTube Embed">YT</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />

      {/* Right side buttons */}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Word count */}
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '10px',
          color: theme.textMuted,
          padding: '4px 8px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '4px',
        }}>
          {wordCount} words | {readingTime} min
        </span>

        {/* Last saved indicator */}
        {lastSaved && (
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: theme.teal,
          }}>
            Saved
          </span>
        )}

        {/* Fullscreen toggle */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          style={{ ...toolbarBtnStyle, fontSize: '12px' }}
          title="Toggle Fullscreen (Cmd+Shift+P)"
        >
          {isFullscreen ? 'Exit' : 'Full'}
        </button>

        <button
          type="button"
          onClick={() => setShowSettings(true)}
          style={{ ...toolbarBtnStyle, fontSize: '12px' }}
          title="API Settings"
        >
          Set
        </button>
        <button
          type="button"
          onClick={handleAIFormat}
          disabled={isFormatting}
          style={{
            ...toolbarBtnStyle,
            background: theme.accent,
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            opacity: isFormatting ? 0.7 : 1,
          }}
          title="AI Auto-Format"
        >
          {isFormatting ? '...' : 'AI'}
        </button>
      </div>
    </div>
    );
  };

  // Settings Modal
  const SettingsModal = () => (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={() => setShowSettings(false)}
    >
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '20px',
          fontStyle: 'italic',
          color: theme.text,
          margin: '0 0 20px 0',
        }}>
          API Settings
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            color: theme.textMuted,
            letterSpacing: '1px',
          }}>
            ANTHROPIC API KEY (CLAUDE)
          </label>
          <input
            type="password"
            value={apiSettings.anthropicKey}
            onChange={(e) => setApiSettings({ ...apiSettings, anthropicKey: e.target.value })}
            placeholder="sk-ant-..."
            style={{
              width: '100%',
              padding: '12px 16px',
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text,
              fontSize: '13px',
              fontFamily: "'Space Mono', monospace",
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            color: theme.textMuted,
            letterSpacing: '1px',
          }}>
            OPENAI API KEY (GPT)
          </label>
          <input
            type="password"
            value={apiSettings.openaiKey}
            onChange={(e) => setApiSettings({ ...apiSettings, openaiKey: e.target.value })}
            placeholder="sk-..."
            style={{
              width: '100%',
              padding: '12px 16px',
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text,
              fontSize: '13px',
              fontFamily: "'Space Mono', monospace",
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            color: theme.textMuted,
            letterSpacing: '1px',
          }}>
            PREFERRED PROVIDER
          </label>
          <select
            value={apiSettings.preferredProvider}
            onChange={(e) => setApiSettings({ ...apiSettings, preferredProvider: e.target.value })}
            style={{
              padding: '12px 16px',
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text,
              fontSize: '13px',
              fontFamily: "'Space Mono', monospace",
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="openai">OpenAI (GPT)</option>
          </select>
        </div>

        {settingsSaved && (
          <p style={{ color: theme.teal, fontSize: '12px', marginBottom: '16px', fontFamily: "'Space Mono', monospace" }}>
            Settings saved!
          </p>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={saveApiSettings}
            style={{
              background: theme.accent,
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: theme.bg,
              cursor: 'pointer',
              letterSpacing: '1px',
            }}
          >
            SAVE
          </button>
          <button
            onClick={() => setShowSettings(false)}
            style={{
              background: 'none',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              padding: '10px 20px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: theme.textMuted,
              cursor: 'pointer',
              letterSpacing: '1px',
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );

  // Draft Recovery Modal
  const DraftModal = () => (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
        }}
      >
        <h3 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '18px',
          fontStyle: 'italic',
          color: theme.text,
          margin: '0 0 12px 0',
        }}>
          Recover Draft?
        </h3>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '13px',
          color: theme.textMuted,
          margin: '0 0 8px 0',
        }}>
          You have an unsaved draft from {savedDraft?.savedAt ? new Date(savedDraft.savedAt).toLocaleString() : 'earlier'}.
        </p>
        {savedDraft?.title && (
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: theme.accent,
            margin: '0 0 20px 0',
          }}>
            "{savedDraft.title}"
          </p>
        )}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={recoverDraft}
            style={{
              background: theme.teal,
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: theme.bg,
              cursor: 'pointer',
              letterSpacing: '1px',
            }}
          >
            RECOVER
          </button>
          <button
            onClick={discardDraft}
            style={{
              background: 'none',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              padding: '10px 20px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: theme.textMuted,
              cursor: 'pointer',
              letterSpacing: '1px',
            }}
          >
            DISCARD
          </button>
        </div>
      </div>
    </div>
  );

  // Fullscreen wrapper style
  const fullscreenStyle = isFullscreen ? {
    position: 'fixed',
    inset: 0,
    zIndex: 99,
    background: theme.bg,
    padding: '24px',
    overflow: 'auto',
  } : {};

  return (
    <div style={fullscreenStyle}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '24px',
            fontStyle: 'italic',
            color: theme.text,
            margin: '0 0 4px 0',
          }}>
            {view === 'list' ? 'Blog Posts' : view === 'create' ? 'New Post' : 'Edit Post'}
          </h1>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: theme.textMuted,
            margin: 0,
          }}>
            {view === 'list' ? `${posts.length} post${posts.length !== 1 ? 's' : ''}` : 'Cmd+S to save draft, Cmd+Enter to publish'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {view === 'list' ? (
            <button
              onClick={handleCreate}
              style={{
                background: theme.accent,
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.bg,
                cursor: 'pointer',
                letterSpacing: '1px',
              }}
            >
              + NEW POST
            </button>
          ) : (
            <button
              onClick={() => {
                setIsFullscreen(false);
                setView('list');
              }}
              style={{
                background: 'none',
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                padding: '10px 20px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                cursor: 'pointer',
                letterSpacing: '1px',
              }}
            >
              BACK
            </button>
          )}
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {posts.length === 0 ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              fontFamily: "'Space Mono', monospace",
              fontSize: '13px',
              color: theme.textMuted,
            }}>
              No blog posts yet. Click "+ NEW POST" to create your first post.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <th style={thStyle}>POST</th>
                  <th style={thStyle}>CATEGORY</th>
                  <th style={thStyle}>STATUS</th>
                  <th style={thStyle}>DATE</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, index) => (
                  <tr
                    key={post.id}
                    style={{
                      borderBottom: index < posts.length - 1 ? `1px solid ${theme.border}` : 'none',
                    }}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{
                        fontFamily: "'Instrument Serif', serif",
                        fontSize: '15px',
                        color: theme.text,
                        marginBottom: '4px',
                      }}>
                        {post.title}
                      </div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        color: theme.textMuted,
                      }}>
                        {post.excerpt?.substring(0, 50)}...
                      </div>
                      {post.tags?.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                          {post.tags.slice(0, 3).map(tag => (
                            <span key={tag} style={{
                              padding: '2px 6px',
                              background: 'rgba(52,152,219,0.1)',
                              color: theme.blue,
                              fontSize: '9px',
                              borderRadius: '3px',
                              fontFamily: "'Space Mono', monospace",
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        background: 'rgba(196,120,90,0.1)',
                        color: theme.accent,
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        borderRadius: '4px',
                      }}>
                        {post.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        background: post.published ? 'rgba(78,205,196,0.1)' : 'rgba(255,255,255,0.05)',
                        color: post.published ? theme.teal : theme.textMuted,
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        borderRadius: '4px',
                        marginRight: '6px',
                      }}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                      {post.featured && (
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          background: 'rgba(255,230,109,0.1)',
                          color: theme.yellow,
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          borderRadius: '4px',
                        }}>
                          Featured
                        </span>
                      )}
                      {post.visibility === 'private' && (
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          background: 'rgba(255,107,107,0.1)',
                          color: theme.danger,
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          borderRadius: '4px',
                          marginLeft: '6px',
                        }}>
                          Private
                        </span>
                      )}
                      {post.visibility === 'password' && (
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          background: 'rgba(155,89,182,0.1)',
                          color: theme.purple,
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          borderRadius: '4px',
                          marginLeft: '6px',
                        }}>
                          Protected
                        </span>
                      )}
                    </td>
                    <td style={{
                      padding: '16px 20px',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      color: theme.textMuted,
                    }}>
                      {post.date}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button onClick={() => handleEdit(post)} style={actionBtnStyle}>Edit</button>
                      <button onClick={() => togglePublish(post.id)} style={{ ...actionBtnStyle, color: theme.teal }}>
                        {post.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => setShowDeleteConfirm(post.id)} style={{ ...actionBtnStyle, color: theme.danger }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create/Edit Form */}
      {(view === 'create' || view === 'edit') && (
        <div
          ref={editorContainerRef}
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Title Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>TITLE</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setFormData({
                      ...formData,
                      title: newTitle,
                      slug: formData.slug || generateSlug(newTitle),
                    });
                  }}
                  placeholder="Enter post title..."
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>URL SLUG</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="auto-generated-from-title"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Excerpt with AI generate */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ ...labelStyle, margin: 0 }}>EXCERPT</label>
                <button
                  type="button"
                  onClick={handleGenerateExcerpt}
                  disabled={isFormatting || !formData.content}
                  style={{
                    background: 'none',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    color: theme.accent,
                    cursor: formData.content ? 'pointer' : 'not-allowed',
                    opacity: formData.content ? 1 : 0.5,
                  }}
                >
                  {isFormatting ? '...' : 'AI Generate'}
                </button>
              </div>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of the post..."
                required
                style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
              />
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '10px',
                color: formData.excerpt.length > 160 ? theme.danger : theme.textMuted,
              }}>
                {formData.excerpt.length}/160 characters
              </span>
            </div>

            {/* Meta Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>META DESCRIPTION (SEO)</label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                placeholder="SEO description for search engines..."
                style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
              />
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '10px',
                color: formData.meta_description.length > 155 ? theme.danger : theme.textMuted,
              }}>
                {formData.meta_description.length}/155 characters (recommended)
              </span>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>TAGS</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      background: 'rgba(52,152,219,0.1)',
                      color: theme.blue,
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      borderRadius: '4px',
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.textMuted,
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '14px',
                        lineHeight: 1,
                      }}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tag..."
                  style={{ ...inputStyle, width: '200px' }}
                />
                <button
                  type="button"
                  onClick={addTag}
                  style={{
                    background: theme.blue,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Content Editor */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>CONTENT</label>

              {/* Editor with drag & drop */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  position: 'relative',
                  border: isDragging ? `2px dashed ${theme.accent}` : 'none',
                  borderRadius: '8px',
                }}
              >
                {isDragging && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(196,120,90,0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}>
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '14px',
                      color: theme.accent,
                    }}>
                      Drop images here
                    </span>
                  </div>
                )}
                <FormattingToolbar />
                <div
                  style={{
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    minHeight: isFullscreen ? 'calc(100vh - 400px)' : '400px',
                    overflow: 'auto',
                  }}
                >
                  <style>{`
                    .tiptap-editor .ProseMirror {
                      min-height: ${isFullscreen ? 'calc(100vh - 400px)' : '400px'};
                      padding: 16px;
                      outline: none;
                      color: #ffffff;
                      font-family: 'Source Serif 4', serif;
                      font-size: 15px;
                      line-height: 1.7;
                    }
                    .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
                      color: #888888;
                      content: attr(data-placeholder);
                      float: left;
                      height: 0;
                      pointer-events: none;
                    }
                    .tiptap-editor .ProseMirror h1 {
                      font-family: 'Instrument Serif', serif;
                      font-size: 32px;
                      font-style: italic;
                      color: #F5F2EB;
                      margin: 32px 0 16px;
                    }
                    .tiptap-editor .ProseMirror h2 {
                      font-family: 'Instrument Serif', serif;
                      font-size: 26px;
                      font-style: italic;
                      color: #F5F2EB;
                      margin: 28px 0 14px;
                    }
                    .tiptap-editor .ProseMirror h3 {
                      font-family: 'Source Serif 4', serif;
                      font-size: 20px;
                      font-weight: 600;
                      color: #F5F2EB;
                      margin: 24px 0 12px;
                    }
                    .tiptap-editor .ProseMirror ul,
                    .tiptap-editor .ProseMirror ol {
                      padding-left: 24px;
                      margin: 16px 0;
                    }
                    .tiptap-editor .ProseMirror li {
                      margin: 8px 0;
                    }
                    .tiptap-editor .ProseMirror blockquote {
                      border-left: 3px solid #C4785A;
                      padding-left: 16px;
                      margin: 16px 0;
                      font-style: italic;
                      color: #A0A0A0;
                    }
                    .tiptap-editor .ProseMirror code {
                      background: rgba(255,255,255,0.08);
                      padding: 2px 6px;
                      border-radius: 4px;
                      font-family: 'Space Mono', monospace;
                      font-size: 14px;
                    }
                    .tiptap-editor .ProseMirror hr {
                      border: none;
                      border-top: 1px solid rgba(255,255,255,0.1);
                      margin: 24px 0;
                    }
                    .tiptap-editor .ProseMirror a {
                      color: #C4785A;
                      text-decoration: underline;
                    }
                    .tiptap-editor .ProseMirror img {
                      max-width: 100%;
                      height: auto;
                      border-radius: 8px;
                      margin: 16px 0;
                    }
                    .tiptap-editor .ProseMirror p {
                      margin: 12px 0;
                    }
                  `}</style>
                  <div className="tiptap-editor">
                    <EditorContent editor={editor} />
                  </div>
                </div>
                {formatError && (
                  <p style={{ color: theme.danger, fontSize: '12px', marginTop: '8px', fontFamily: "'Space Mono', monospace" }}>
                    {formatError}
                  </p>
                )}
              </div>
            </div>

            {/* Settings Row */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>CATEGORY</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={selectStyle}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>VISIBILITY</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value, password: e.target.value !== 'password' ? '' : formData.password })}
                  style={selectStyle}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="password">Password</option>
                </select>
              </div>

              {formData.visibility === 'password' && (
                <div>
                  <label style={labelStyle}>PASSWORD</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password..."
                    required
                    style={{ ...inputStyle, width: '150px' }}
                  />
                </div>
              )}

              <div>
                <label style={labelStyle}>OPTIONS</label>
                <div style={{ display: 'flex', gap: '20px', paddingTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ color: theme.textMuted, fontSize: '13px' }}>Published</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ color: theme.textMuted, fontSize: '13px' }}>Featured</span>
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                style={{
                  background: theme.accent,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  color: theme.bg,
                  cursor: 'pointer',
                  letterSpacing: '1px',
                }}
              >
                {view === 'create' ? 'CREATE POST' : 'UPDATE POST'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFullscreen(false);
                  setView('list');
                }}
                style={{
                  background: 'none',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  color: theme.textMuted,
                  cursor: 'pointer',
                  letterSpacing: '1px',
                }}
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && <SettingsModal />}

      {/* Draft Recovery Modal */}
      {showDraftModal && savedDraft && <DraftModal />}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: '18px',
              fontStyle: 'italic',
              color: theme.text,
              margin: '0 0 12px 0',
            }}>
              Delete Post?
            </h3>
            <p style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '13px',
              color: theme.textMuted,
              margin: '0 0 20px 0',
            }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                style={{
                  background: theme.danger,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  color: '#fff',
                  cursor: 'pointer',
                  letterSpacing: '1px',
                }}
              >
                DELETE
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  background: 'none',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  color: theme.textMuted,
                  cursor: 'pointer',
                  letterSpacing: '1px',
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Shared styles
const thStyle = {
  padding: '16px 20px',
  textAlign: 'left',
  fontFamily: "'Space Mono', monospace",
  fontSize: '11px',
  color: '#888888',
  letterSpacing: '1px',
  fontWeight: '500',
};

const actionBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#888888',
  cursor: 'pointer',
  fontFamily: "'Space Mono', monospace",
  fontSize: '11px',
  padding: '4px 8px',
};

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontFamily: "'Space Mono', monospace",
  fontSize: '11px',
  color: '#888888',
  letterSpacing: '1px',
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: '#0a0a0a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '15px',
  fontFamily: "'Source Serif 4', serif",
  outline: 'none',
  boxSizing: 'border-box',
};

const selectStyle = {
  padding: '12px 16px',
  background: '#0a0a0a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '13px',
  fontFamily: "'Space Mono', monospace",
  outline: 'none',
  cursor: 'pointer',
};

export default BlogSection;
