import React, { useState, useEffect, useRef } from 'react';
import { useBlog } from './BlogContext';
import { parseMarkdown } from './utils/parseMarkdown';
import { aiAutoFormat } from './utils/aiFormat';
import { supabase } from './supabaseClient';

const CATEGORIES = ['ECOSYSTEM', 'STARTUP', 'JOURNEY', 'TECH', 'PERSONAL', 'INSIGHTS', 'PHILOSOPHY'];

export default function BlogAdmin({ onClose, editPostId = null }) {
  const { posts, createPost, updatePost, deletePost, togglePublish, getPost } = useBlog();
  const [view, setView] = useState(editPostId ? 'edit' : 'list');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [formatError, setFormatError] = useState(null);
  const textareaRef = useRef(null);
  const initializedRef = useRef(false);

  // API Settings state
  const [apiSettings, setApiSettings] = useState({
    anthropicKey: '',
    openaiKey: '',
    preferredProvider: 'anthropic',
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'ECOSYSTEM',
    published: false,
    featured: false,
    visibility: 'public',
    password: '',
  });

  // Load API settings (localStorage fallback if Supabase table doesn't exist)
  useEffect(() => {
    const loadSettings = async () => {
      // Try localStorage first (faster)
      const localSettings = localStorage.getItem('blog_api_settings');
      if (localSettings) {
        try {
          const parsed = JSON.parse(localSettings);
          setApiSettings(parsed);
        } catch (e) {
          console.log('Invalid localStorage settings');
        }
      }

      // Also try Supabase (if table exists)
      try {
        const { data } = await supabase
          .from('api_settings')
          .select('*')
          .single();

        if (data) {
          const supabaseSettings = {
            anthropicKey: data.anthropic_key || '',
            openaiKey: data.openai_key || '',
            preferredProvider: data.preferred_provider || 'anthropic',
          };
          setApiSettings(supabaseSettings);
          // Sync to localStorage
          localStorage.setItem('blog_api_settings', JSON.stringify(supabaseSettings));
        }
      } catch (err) {
        // Settings table might not exist - use localStorage only
        console.log('Supabase settings not available, using localStorage');
      }
    };
    loadSettings();
  }, []);

  // Initialize form with edit post data
  useEffect(() => {
    if (!editPostId || initializedRef.current) return;
    const post = getPost(editPostId);
    if (post) {
      initializedRef.current = true;
      setFormData(post);
      setSelectedPost(post);
      setView('edit');
    }
  }, [editPostId, getPost]);

  // Save API settings (localStorage + Supabase)
  const saveApiSettings = async () => {
    // Always save to localStorage (works without Supabase table)
    localStorage.setItem('blog_api_settings', JSON.stringify(apiSettings));

    // Try to save to Supabase (may fail if table doesn't exist)
    try {
      const { error } = await supabase
        .from('api_settings')
        .upsert({
          id: 1,
          anthropic_key: apiSettings.anthropicKey,
          openai_key: apiSettings.openaiKey,
          preferred_provider: apiSettings.preferredProvider,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.log('Supabase save skipped (table may not exist), using localStorage');
      }
    } catch (err) {
      console.log('Supabase save failed, using localStorage only');
    }

    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  // Format toolbar insert
  const insertFormat = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const selectedText = text.substring(start, end);

    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    setFormData({ ...formData, content: newText });

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
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
    } catch (err) {
      setFormatError(err.message);
    } finally {
      setIsFormatting(false);
    }
  };

  const handleEdit = (post) => {
    setFormData({
      ...post,
      visibility: post.visibility || 'public',
      password: post.password || '',
    });
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
    });
    setSelectedPost(null);
    setView('create');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (view === 'create') {
      createPost(formData);
    } else {
      updatePost(selectedPost.id, formData);
    }
    setView('list');
  };

  const handleDelete = (id) => {
    deletePost(id);
    setShowDeleteConfirm(null);
  };

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.95)',
      zIndex: 2000,
      overflow: 'auto',
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '24px',
      minHeight: '100vh',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      paddingBottom: '16px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    title: {
      fontFamily: "'Instrument Serif', serif",
      fontSize: '32px',
      fontStyle: 'italic',
      color: '#F5F2EB',
    },
    closeBtn: {
      background: 'none',
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#A0A0A0',
      padding: '10px 20px',
      cursor: 'pointer',
      fontFamily: "'Space Mono', monospace",
      fontSize: '12px',
      transition: 'all 0.3s ease',
    },
    createBtn: {
      background: '#C4785A',
      border: 'none',
      color: '#0D0D0D',
      padding: '12px 24px',
      cursor: 'pointer',
      fontFamily: "'Space Mono', monospace",
      fontSize: '12px',
      letterSpacing: '1px',
      marginRight: '12px',
    },
    settingsBtn: {
      background: 'none',
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#A0A0A0',
      padding: '10px 20px',
      cursor: 'pointer',
      fontFamily: "'Space Mono', monospace",
      fontSize: '12px',
      marginRight: '12px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '12px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      fontFamily: "'Space Mono', monospace",
      fontSize: '10px',
      letterSpacing: '1px',
      color: '#666',
      textTransform: 'uppercase',
    },
    td: {
      padding: '16px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      color: '#A0A0A0',
      fontSize: '14px',
    },
    postTitle: {
      color: '#F5F2EB',
      fontFamily: "'Source Serif 4', serif",
      fontSize: '16px',
      marginBottom: '4px',
    },
    badge: {
      display: 'inline-block',
      padding: '4px 8px',
      fontSize: '10px',
      fontFamily: "'Space Mono', monospace",
      borderRadius: '2px',
      marginRight: '8px',
    },
    actionBtn: {
      background: 'none',
      border: 'none',
      color: '#A0A0A0',
      cursor: 'pointer',
      padding: '8px 12px',
      fontSize: '12px',
      fontFamily: "'Space Mono', monospace",
      transition: 'color 0.3s ease',
    },
    // Editor styles
    editorContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
    },
    editorPanel: {
      display: 'flex',
      flexDirection: 'column',
    },
    previewPanel: {
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '4px',
      overflow: 'auto',
      maxHeight: '600px',
    },
    previewHeader: {
      padding: '12px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      fontFamily: "'Space Mono', monospace",
      fontSize: '10px',
      letterSpacing: '2px',
      color: '#666',
    },
    previewContent: {
      padding: '24px',
      color: '#D0D0D0',
      fontFamily: "'Source Serif 4', serif",
      fontSize: '16px',
      lineHeight: '1.8',
    },
    toolbar: {
      display: 'flex',
      gap: '4px',
      marginBottom: '12px',
      flexWrap: 'wrap',
      padding: '8px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderBottom: 'none',
    },
    toolbarBtn: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#A0A0A0',
      padding: '8px 12px',
      cursor: 'pointer',
      fontFamily: "'Space Mono', monospace",
      fontSize: '11px',
      transition: 'all 0.2s ease',
    },
    toolbarBtnActive: {
      background: '#C4785A',
      color: '#0D0D0D',
      border: '1px solid #C4785A',
    },
    aiBtn: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      color: '#fff',
      padding: '8px 16px',
      cursor: 'pointer',
      fontFamily: "'Space Mono', monospace",
      fontSize: '11px',
      marginLeft: 'auto',
    },
    formGroup: {
      marginBottom: '24px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontFamily: "'Space Mono', monospace",
      fontSize: '11px',
      letterSpacing: '1px',
      color: '#666',
      textTransform: 'uppercase',
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#F5F2EB',
      fontSize: '16px',
      fontFamily: "'Source Serif 4', serif",
      outline: 'none',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#F5F2EB',
      fontSize: '15px',
      fontFamily: "'Source Serif 4', serif",
      outline: 'none',
      resize: 'vertical',
      lineHeight: '1.7',
      boxSizing: 'border-box',
    },
    select: {
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#F5F2EB',
      fontSize: '14px',
      fontFamily: "'Space Mono', monospace",
      outline: 'none',
      cursor: 'pointer',
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
    },
    checkboxInput: {
      width: '20px',
      height: '20px',
      cursor: 'pointer',
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '32px',
    },
    submitBtn: {
      background: '#C4785A',
      border: 'none',
      color: '#0D0D0D',
      padding: '14px 32px',
      cursor: 'pointer',
      fontFamily: "'Space Mono', monospace",
      fontSize: '12px',
      letterSpacing: '1px',
    },
    cancelBtn: {
      background: 'none',
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#A0A0A0',
      padding: '14px 32px',
      cursor: 'pointer',
      fontFamily: "'Space Mono', monospace",
      fontSize: '12px',
    },
    modal: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#1a1a1a',
      border: '1px solid rgba(255,255,255,0.1)',
      padding: '32px',
      zIndex: 3000,
      maxWidth: '500px',
      width: '90%',
    },
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 2500,
    },
    error: {
      color: '#ff6b6b',
      fontSize: '12px',
      marginTop: '8px',
      fontFamily: "'Space Mono', monospace",
    },
    success: {
      color: '#4ECDC4',
      fontSize: '12px',
      marginTop: '8px',
      fontFamily: "'Space Mono', monospace",
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#666',
    },
  };

  // Settings Modal
  const SettingsModal = () => (
    <>
      <div style={styles.modalOverlay} onClick={() => setShowSettings(false)} />
      <div style={styles.modal}>
        <h3 style={{ color: '#F5F2EB', marginBottom: '24px', fontFamily: "'Instrument Serif', serif", fontSize: '24px' }}>
          API Settings
        </h3>

        <div style={styles.formGroup}>
          <label style={styles.label}>Anthropic API Key (Claude)</label>
          <input
            type="password"
            style={styles.input}
            value={apiSettings.anthropicKey}
            onChange={(e) => setApiSettings({ ...apiSettings, anthropicKey: e.target.value })}
            placeholder="sk-ant-..."
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>OpenAI API Key (GPT)</label>
          <input
            type="password"
            style={styles.input}
            value={apiSettings.openaiKey}
            onChange={(e) => setApiSettings({ ...apiSettings, openaiKey: e.target.value })}
            placeholder="sk-..."
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Preferred Provider</label>
          <select
            style={styles.select}
            value={apiSettings.preferredProvider}
            onChange={(e) => setApiSettings({ ...apiSettings, preferredProvider: e.target.value })}
          >
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="openai">OpenAI (GPT)</option>
          </select>
        </div>

        {settingsSaved && <p style={styles.success}>Settings saved!</p>}

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button style={styles.submitBtn} onClick={saveApiSettings}>
            SAVE SETTINGS
          </button>
          <button style={styles.cancelBtn} onClick={() => setShowSettings(false)}>
            CLOSE
          </button>
        </div>
      </div>
    </>
  );

  // Formatting Toolbar
  const FormattingToolbar = () => (
    <div style={styles.toolbar}>
      <button
        type="button"
        style={styles.toolbarBtn}
        onClick={() => insertFormat('# ')}
        title="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        style={styles.toolbarBtn}
        onClick={() => insertFormat('## ')}
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        style={styles.toolbarBtn}
        onClick={() => insertFormat('### ')}
        title="Heading 3"
      >
        H3
      </button>
      <span style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
      <button
        type="button"
        style={styles.toolbarBtn}
        onClick={() => insertFormat('**', '**')}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        style={styles.toolbarBtn}
        onClick={() => insertFormat('*', '*')}
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        style={styles.toolbarBtn}
        onClick={() => insertFormat('`', '`')}
        title="Code"
      >
        {'</>'}
      </button>
      <span style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
      <button
        type="button"
        style={styles.toolbarBtn}
        onClick={() => insertFormat('- ')}
        title="Bullet List"
      >
        • List
      </button>
      <button
        type="button"
        style={styles.toolbarBtn}
        onClick={() => insertFormat('1. ')}
        title="Numbered List"
      >
        1. List
      </button>
      <button
        type="button"
        style={styles.toolbarBtn}
        onClick={() => insertFormat('> ')}
        title="Quote"
      >
        " Quote
      </button>
      <button
        type="button"
        style={styles.toolbarBtn}
        onClick={() => insertFormat('\n---\n')}
        title="Divider"
      >
        ―
      </button>
      <button
        type="button"
        style={{
          ...styles.aiBtn,
          opacity: isFormatting ? 0.7 : 1,
          cursor: isFormatting ? 'wait' : 'pointer',
        }}
        onClick={handleAIFormat}
        disabled={isFormatting}
        title="AI Auto-Format"
      >
        {isFormatting ? 'Formatting...' : '✨ AI Format'}
      </button>
    </div>
  );

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            {view === 'list' ? 'Blog Admin' : view === 'create' ? 'New Post' : 'Edit Post'}
          </h1>
          <div>
            {view === 'list' && (
              <>
                <button style={styles.createBtn} onClick={handleCreate}>
                  + NEW POST
                </button>
                <button
                  style={styles.settingsBtn}
                  onClick={() => setShowSettings(true)}
                  onMouseEnter={(e) => e.target.style.borderColor = '#C4785A'}
                  onMouseLeave={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                >
                  ⚙ SETTINGS
                </button>
              </>
            )}
            <button
              style={styles.closeBtn}
              onClick={() => view === 'list' ? onClose() : setView('list')}
              onMouseEnter={(e) => e.target.style.borderColor = '#C4785A'}
              onMouseLeave={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            >
              {view === 'list' ? 'CLOSE' : 'BACK'}
            </button>
          </div>
        </div>

        {/* List View */}
        {view === 'list' && (
          <>
            {posts.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={{ fontSize: '18px', marginBottom: '16px' }}>No blog posts yet</p>
                <button style={styles.createBtn} onClick={handleCreate}>
                  Create your first post
                </button>
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Post</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.id}>
                      <td style={styles.td}>
                        <div style={styles.postTitle}>{post.title}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {post.excerpt?.substring(0, 60)}...
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: 'rgba(196,120,90,0.1)',
                          color: '#C4785A',
                        }}>
                          {post.category}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: post.published ? 'rgba(78,205,196,0.1)' : 'rgba(255,255,255,0.05)',
                          color: post.published ? '#4ECDC4' : '#666',
                        }}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                        {post.featured && (
                          <span style={{
                            ...styles.badge,
                            background: 'rgba(255,230,109,0.1)',
                            color: '#FFE66D',
                          }}>
                            Featured
                          </span>
                        )}
                        {post.visibility === 'private' && (
                          <span style={{
                            ...styles.badge,
                            background: 'rgba(255,107,107,0.1)',
                            color: '#ff6b6b',
                          }}>
                            Private
                          </span>
                        )}
                        {post.visibility === 'password' && (
                          <span style={{
                            ...styles.badge,
                            background: 'rgba(155,89,182,0.1)',
                            color: '#9b59b6',
                          }}>
                            Protected
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px' }}>
                          {post.date}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.actionBtn}
                          onClick={() => handleEdit(post)}
                          onMouseEnter={(e) => e.target.style.color = '#C4785A'}
                          onMouseLeave={(e) => e.target.style.color = '#A0A0A0'}
                        >
                          Edit
                        </button>
                        <button
                          style={styles.actionBtn}
                          onClick={() => togglePublish(post.id)}
                          onMouseEnter={(e) => e.target.style.color = '#4ECDC4'}
                          onMouseLeave={(e) => e.target.style.color = '#A0A0A0'}
                        >
                          {post.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          style={styles.actionBtn}
                          onClick={() => setShowDeleteConfirm(post.id)}
                          onMouseEnter={(e) => e.target.style.color = '#ff6b6b'}
                          onMouseLeave={(e) => e.target.style.color = '#A0A0A0'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* Create/Edit Form */}
        {(view === 'create' || view === 'edit') && (
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                style={styles.input}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter post title..."
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Excerpt</label>
              <textarea
                style={{ ...styles.textarea, minHeight: '80px' }}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of the post..."
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Content (Markdown)</label>
              <div style={styles.editorContainer}>
                {/* Editor Panel */}
                <div style={styles.editorPanel}>
                  <FormattingToolbar />
                  <textarea
                    ref={textareaRef}
                    style={{ ...styles.textarea, minHeight: '500px', borderTop: 'none' }}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your blog post content here...

Paste raw text and click 'AI Format' to auto-format with markdown.

Or use the toolbar buttons to format manually."
                    required
                  />
                  {formatError && <p style={styles.error}>{formatError}</p>}
                </div>

                {/* Preview Panel */}
                <div style={styles.previewPanel}>
                  <div style={styles.previewHeader}>LIVE PREVIEW</div>
                  <div style={styles.previewContent}>
                    {formData.content ? (
                      parseMarkdown(formData.content)
                    ) : (
                      <p style={{ color: '#666', fontStyle: 'italic' }}>
                        Start typing to see preview...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Post Settings Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '24px',
              marginTop: '16px',
              padding: '24px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
            }}>
              {/* Category */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  style={{ ...styles.select, width: '100%' }}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Visibility */}
              <div style={styles.formGroup}>
                <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px' }}>🔒</span> Visibility
                </label>
                <select
                  style={{ ...styles.select, width: '100%' }}
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value, password: e.target.value !== 'password' ? '' : formData.password })}
                >
                  <option value="public">🌐 Public</option>
                  <option value="private">🔐 Private (Admin Only)</option>
                  <option value="password">🔑 Password Protected</option>
                </select>
              </div>

              {/* Password Field - Shows when password protection selected */}
              {formData.visibility === 'password' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Post Password</label>
                  <input
                    type="text"
                    style={{ ...styles.input, width: '100%' }}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password..."
                    required={formData.visibility === 'password'}
                  />
                </div>
              )}

              {/* Options */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Options</label>
                <div style={{ display: 'flex', gap: '24px', paddingTop: '8px' }}>
                  <label style={styles.checkbox}>
                    <input
                      type="checkbox"
                      style={styles.checkboxInput}
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    />
                    <span style={{ color: '#A0A0A0', fontSize: '14px' }}>Published</span>
                  </label>
                  <label style={styles.checkbox}>
                    <input
                      type="checkbox"
                      style={styles.checkboxInput}
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <span style={{ color: '#A0A0A0', fontSize: '14px' }}>Featured</span>
                  </label>
                </div>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.submitBtn}>
                {view === 'create' ? 'CREATE POST' : 'UPDATE POST'}
              </button>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={() => setView('list')}
              >
                CANCEL
              </button>
            </div>
          </form>
        )}

        {/* Settings Modal */}
        {showSettings && <SettingsModal />}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <>
            <div style={styles.modalOverlay} onClick={() => setShowDeleteConfirm(null)} />
            <div style={styles.modal}>
              <h3 style={{ color: '#F5F2EB', marginBottom: '16px', fontFamily: "'Instrument Serif', serif" }}>
                Delete Post?
              </h3>
              <p style={{ color: '#A0A0A0', marginBottom: '24px', fontSize: '14px' }}>
                This action cannot be undone. The post will be permanently deleted.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  style={{ ...styles.submitBtn, background: '#ff6b6b' }}
                  onClick={() => handleDelete(showDeleteConfirm)}
                >
                  DELETE
                </button>
                <button
                  style={styles.cancelBtn}
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
