import React from 'react';

// Markdown styles for rendering
export const markdownStyles = {
  h1: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: '36px',
    fontStyle: 'italic',
    color: '#F5F2EB',
    marginTop: '48px',
    marginBottom: '24px',
  },
  h2: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: '28px',
    fontStyle: 'italic',
    color: '#F5F2EB',
    marginTop: '40px',
    marginBottom: '20px',
  },
  h3: {
    fontFamily: "'Source Serif 4', serif",
    fontSize: '22px',
    fontWeight: '600',
    color: '#F5F2EB',
    marginTop: '32px',
    marginBottom: '16px',
  },
  paragraph: {
    marginBottom: '20px',
    color: '#D0D0D0',
  },
  list: {
    marginBottom: '24px',
    paddingLeft: '24px',
    color: '#D0D0D0',
  },
  listItem: {
    marginBottom: '8px',
    paddingLeft: '8px',
    color: '#D0D0D0',
  },
  blockquote: {
    borderLeft: '3px solid #C4785A',
    paddingLeft: '20px',
    margin: '24px 0',
    fontStyle: 'italic',
    color: '#A0A0A0',
  },
  hr: {
    border: 'none',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    margin: '32px 0',
  },
  code: {
    background: 'rgba(255,255,255,0.05)',
    padding: '2px 6px',
    borderRadius: '3px',
    fontFamily: "'Space Mono', monospace",
    fontSize: '14px',
  },
};

// Parse markdown text to React elements
export function parseMarkdown(text, customStyles = {}) {
  if (!text) return null;

  const styles = { ...markdownStyles, ...customStyles };
  const lines = text.split('\n');
  const result = [];
  let inList = false;
  let listItems = [];
  let listType = null;

  const processInline = (text) => {
    return text
      // Images: ![alt](url)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;" />')
      // Links: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#C4785A;text-decoration:underline;">$1</a>')
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:3px;font-family:monospace;font-size:14px;">$1</code>');
  };

  // Check for YouTube embed
  const processEmbed = (line, index) => {
    const youtubeMatch = line.match(/\{\{youtube:([a-zA-Z0-9_-]+)\}\}/);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return (
        <div key={index} style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', margin: '24px 0', borderRadius: '8px' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube video"
          />
        </div>
      );
    }
    return null;
  };

  const processLine = (line, index) => {
    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      return <hr key={index} style={styles.hr} />;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      return (
        <blockquote key={index} style={styles.blockquote}>
          <span dangerouslySetInnerHTML={{ __html: processInline(line.slice(2)) }} />
        </blockquote>
      );
    }

    // Headers
    if (line.startsWith('### ')) {
      return <h3 key={index} style={styles.h3}>{line.slice(4)}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} style={styles.h2}>{line.slice(3)}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={index} style={styles.h1}>{line.slice(2)}</h1>;
    }

    // Unordered list
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return { type: 'ul', content: processInline(line.slice(2)) };
    }

    // Ordered list
    const orderedMatch = line.match(/^(\d+)\.\s(.+)/);
    if (orderedMatch) {
      return { type: 'ol', content: processInline(orderedMatch[2]) };
    }

    // Empty line
    if (line.trim() === '') {
      return <br key={index} />;
    }

    // Regular paragraph
    return (
      <p key={index} style={{ ...styles.paragraph, color: '#D0D0D0' }}>
        <span dangerouslySetInnerHTML={{ __html: processInline(line) }} />
      </p>
    );
  };

  const flushList = (index) => {
    if (inList && listItems.length > 0) {
      const ListTag = listType === 'ol' ? 'ol' : 'ul';
      result.push(
        <ListTag key={`list-${index}`} style={styles.list}>
          {listItems.map((item, i) => (
            <li key={i} style={styles.listItem}>
              <span style={{ color: '#D0D0D0' }} dangerouslySetInnerHTML={{ __html: item }} />
            </li>
          ))}
        </ListTag>
      );
      listItems = [];
      inList = false;
      listType = null;
    }
  };

  lines.forEach((line, index) => {
    // Check for embeds first (YouTube, etc.)
    const embed = processEmbed(line, index);
    if (embed) {
      flushList(index);
      result.push(embed);
      return;
    }

    const processed = processLine(line, index);

    if (processed && typeof processed === 'object' && processed.type) {
      if (!inList || listType !== processed.type) {
        flushList(index);
        inList = true;
        listType = processed.type;
      }
      listItems.push(processed.content);
    } else {
      flushList(index);
      if (processed) {
        result.push(processed);
      }
    }
  });

  // Handle remaining list items
  flushList('final');

  return result.length > 0 ? result : null;
}

export default parseMarkdown;
