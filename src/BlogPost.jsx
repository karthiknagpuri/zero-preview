import React, { useState } from 'react';
import { useBlog } from './BlogContext';

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#0D0D0D',
    zIndex: 2000,
    overflow: 'auto',
  },
  container: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '24px',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '48px',
    paddingTop: '24px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#A0A0A0',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: '12px',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 0',
    marginBottom: '32px',
    transition: 'color 0.3s ease',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  category: {
    fontFamily: "'Space Mono', monospace",
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#C4785A',
    background: 'rgba(196,120,90,0.1)',
    padding: '6px 12px',
  },
  date: {
    fontFamily: "'Space Mono', monospace",
    fontSize: '12px',
    color: '#666',
  },
  readTime: {
    fontFamily: "'Space Mono', monospace",
    fontSize: '12px',
    color: '#666',
  },
  title: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: 'clamp(32px, 6vw, 48px)',
    fontStyle: 'italic',
    color: '#F5F2EB',
    lineHeight: '1.2',
    marginBottom: '24px',
  },
  excerpt: {
    fontFamily: "'Source Serif 4', serif",
    fontSize: '20px',
    color: '#A0A0A0',
    lineHeight: '1.6',
    borderLeft: '2px solid #C4785A',
    paddingLeft: '20px',
    marginBottom: '48px',
  },
  article: {
    fontFamily: "'Source Serif 4', serif",
    fontSize: '18px',
    lineHeight: '1.8',
    color: '#D0D0D0',
  },
  footer: {
    marginTop: '64px',
    paddingTop: '32px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  editBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#A0A0A0',
    padding: '10px 20px',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: '11px',
    letterSpacing: '1px',
    transition: 'all 0.3s ease',
  },
  notFound: {
    textAlign: 'center',
    padding: '100px 20px',
  },
};

// Render markdown content to React elements
function renderMarkdown(content) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let listItems = [];
  let listType = null;
  let keyIndex = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      const Tag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <Tag key={`list-${keyIndex++}`} style={{
          marginBottom: '24px',
          paddingLeft: '28px',
          color: '#D0D0D0',
        }}>
          {listItems.map((item, i) => (
            <li key={i} style={{
              marginBottom: '12px',
              paddingLeft: '8px',
              color: '#D0D0D0',
              lineHeight: '1.7',
            }}>
              {renderInline(item)}
            </li>
          ))}
        </Tag>
      );
      listItems = [];
      listType = null;
    }
  };

  // Process inline formatting (bold, italic, code)
  const renderInline = (text) => {
    if (!text) return null;

    const parts = [];
    let remaining = text;
    let partKey = 0;

    // Process patterns
    const patterns = [
      { regex: /\*\*\*(.*?)\*\*\*/g, render: (m) => <strong key={partKey++}><em>{m}</em></strong> },
      { regex: /\*\*(.*?)\*\*/g, render: (m) => <strong key={partKey++} style={{ color: '#F5F2EB' }}>{m}</strong> },
      { regex: /\*(.*?)\*/g, render: (m) => <em key={partKey++}>{m}</em> },
      { regex: /`(.*?)`/g, render: (m) => <code key={partKey++} style={{
        background: 'rgba(255,255,255,0.08)',
        padding: '2px 6px',
        borderRadius: '3px',
        fontFamily: "'Space Mono', monospace",
        fontSize: '14px',
        color: '#C4785A',
      }}>{m}</code> },
    ];

    // Simple inline rendering - just return the text with basic formatting
    let result = text;

    // Replace images: ![alt](url)
    result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;height:auto;border-radius:8px;margin:16px 0;display:block;" />');
    // Replace links: [text](url)
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#C4785A;text-decoration:underline;">$1</a>');
    // Replace ***text*** with bold+italic
    result = result.replace(/\*\*\*(.*?)\*\*\*/g, '<b><i>$1</i></b>');
    // Replace **text** with bold
    result = result.replace(/\*\*(.*?)\*\*/g, '<b style="color:#F5F2EB">$1</b>');
    // Replace *text* with italic
    result = result.replace(/\*(.*?)\*/g, '<i>$1</i>');
    // Replace `code` with code styling
    result = result.replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:3px;font-family:monospace;font-size:14px;color:#C4785A">$1</code>');

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***') {
      flushList();
      elements.push(
        <hr key={`hr-${keyIndex++}`} style={{
          border: 'none',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          margin: '40px 0',
        }} />
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={`bq-${keyIndex++}`} style={{
          borderLeft: '3px solid #C4785A',
          paddingLeft: '20px',
          margin: '28px 0',
          fontStyle: 'italic',
          color: '#A0A0A0',
          lineHeight: '1.7',
        }}>
          {renderInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // H3 Header
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${keyIndex++}`} style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: '20px',
          fontWeight: '600',
          color: '#F5F2EB',
          marginTop: '36px',
          marginBottom: '16px',
          lineHeight: '1.4',
        }}>
          {line.slice(4)}
        </h3>
      );
      continue;
    }

    // H2 Header
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${keyIndex++}`} style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '26px',
          fontStyle: 'italic',
          color: '#F5F2EB',
          marginTop: '44px',
          marginBottom: '20px',
          lineHeight: '1.3',
        }}>
          {line.slice(3)}
        </h2>
      );
      continue;
    }

    // H1 Header
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={`h1-${keyIndex++}`} style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '32px',
          fontStyle: 'italic',
          color: '#F5F2EB',
          marginTop: '48px',
          marginBottom: '24px',
          lineHeight: '1.2',
        }}>
          {line.slice(2)}
        </h1>
      );
      continue;
    }

    // Unordered list item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(line.slice(2));
      continue;
    }

    // Ordered list item
    const orderedMatch = line.match(/^(\d+)\.\s(.+)/);
    if (orderedMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(orderedMatch[2]);
      continue;
    }

    // Empty line
    if (trimmed === '') {
      flushList();
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${keyIndex++}`} style={{
        marginBottom: '20px',
        color: '#D0D0D0',
        lineHeight: '1.8',
      }}>
        {renderInline(line)}
      </p>
    );
  }

  // Flush any remaining list
  flushList();

  return elements;
}

export default function BlogPost({ postId, onClose, onEdit, showEditButton = false }) {
  const { getPost, verifyPostPassword } = useBlog();
  const post = getPost(postId);
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // Check if post needs password
  const needsPassword = post?.visibility === 'password' && !isUnlocked;

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (verifyPostPassword(postId, passwordInput)) {
      setIsUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  if (!post) {
    return (
      <div style={styles.overlay}>
        <div style={styles.container}>
          <button
            style={styles.backBtn}
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.color = '#C4785A'}
            onMouseLeave={(e) => e.target.style.color = '#A0A0A0'}
          >
            ← BACK
          </button>
          <div style={styles.notFound}>
            <h2 style={{ ...styles.title, fontSize: '32px' }}>Post not found</h2>
            <p style={{ color: '#666' }}>This post may have been deleted or doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  // Password protected post - show password form
  if (needsPassword) {
    return (
      <div style={styles.overlay}>
        <div style={styles.container}>
          <button
            style={styles.backBtn}
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.color = '#C4785A'}
            onMouseLeave={(e) => e.target.style.color = '#A0A0A0'}
          >
            ← BACK
          </button>

          <div style={{
            maxWidth: '400px',
            margin: '100px auto',
            textAlign: 'center',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 24px',
              background: 'rgba(155,89,182,0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}>
              🔒
            </div>

            <h2 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: '28px',
              fontStyle: 'italic',
              color: '#F5F2EB',
              marginBottom: '12px',
            }}>
              {post.title}
            </h2>

            <p style={{
              color: '#A0A0A0',
              fontSize: '16px',
              marginBottom: '32px',
              lineHeight: '1.6',
            }}>
              This post is password protected. Enter the password to view.
            </p>

            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                placeholder="Enter password..."
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: passwordError ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.1)',
                  color: '#F5F2EB',
                  fontSize: '16px',
                  fontFamily: "'Source Serif 4', serif",
                  outline: 'none',
                  marginBottom: '16px',
                  boxSizing: 'border-box',
                }}
              />

              {passwordError && (
                <p style={{
                  color: '#ff6b6b',
                  fontSize: '14px',
                  marginBottom: '16px',
                  fontFamily: "'Space Mono', monospace",
                }}>
                  Incorrect password. Please try again.
                </p>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: '#9b59b6',
                  border: 'none',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: '1px',
                  cursor: 'pointer',
                }}
              >
                UNLOCK POST
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button
            style={styles.backBtn}
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.color = '#C4785A'}
            onMouseLeave={(e) => e.target.style.color = '#A0A0A0'}
          >
            ← BACK TO WRITING
          </button>

          <div style={styles.meta}>
            <span style={styles.category}>{post.category}</span>
            <span style={styles.date}>{post.date}</span>
            <span style={styles.readTime}>{post.readTime} read</span>
          </div>

          <h1 style={styles.title}>{post.title}</h1>

          <p style={styles.excerpt}>{post.excerpt}</p>
        </div>

        {/* Content */}
        <article style={styles.article}>
          {renderMarkdown(post.content)}
        </article>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            style={styles.backBtn}
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.color = '#C4785A'}
            onMouseLeave={(e) => e.target.style.color = '#A0A0A0'}
          >
            ← BACK TO WRITING
          </button>

          {showEditButton && onEdit && (
            <button
              style={styles.editBtn}
              onClick={() => onEdit(post.id)}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#C4785A';
                e.target.style.color = '#C4785A';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                e.target.style.color = '#A0A0A0';
              }}
            >
              EDIT POST
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
