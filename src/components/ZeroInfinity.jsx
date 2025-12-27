import React from 'react';

export const ZeroInfinity = ({ theme }) => {
  const LIFE_CHANGING_BLOG_URL =
    'https://3010tangents.wordpress.com/2014/09/08/zero-and-infinity-from-nothing-to-everything/';

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
    }}>
      {/* Section Label */}
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: '11px',
        letterSpacing: '2px',
        color: theme.accent,
        marginBottom: '16px',
      }}>
        PHILOSOPHY
      </div>

      {/* Main Title */}
      <h2 style={{
        fontFamily: "'Instrument Serif', serif",
        fontWeight: '400',
        fontStyle: 'italic',
        fontSize: 'clamp(32px, 8vw, 48px)',
        color: theme.text,
        marginBottom: '40px',
        lineHeight: '1.1',
      }}>
        the paradox of being zero
      </h2>

      {/* Opening Story */}
      <div style={{
        fontSize: 'clamp(16px, 4vw, 20px)',
        lineHeight: '1.7',
        color: theme.textSecondary,
        marginBottom: '32px',
      }}>
        <p style={{ marginBottom: '24px' }}>
          During COVID, I sat in a hospital waiting hall after 14 days in ICU with my family. 
          Scrolling through my phone for vaccine updates, I stumbled upon a random blog from 2014. 
          It spoke of <span style={{ color: theme.text, fontWeight: '500' }}>sunya</span>—the 
          Sanskrit word for zero that also means universe. That moment changed everything.
        </p>
      </div>

      {/* Featured Quote Block */}
      <div style={{
        padding: 'clamp(24px, 5vw, 40px)',
        background: 'rgba(78,205,196,0.05)',
        borderLeft: '3px solid #4ECDC4',
        marginBottom: '40px',
      }}>
        <p style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 'clamp(18px, 4vw, 24px)',
          fontStyle: 'italic',
          lineHeight: '1.6',
          color: theme.text,
          marginBottom: '16px',
        }}>
          "Sunya" means <span style={{ color: '#4ECDC4', fontWeight: '600' }}>void</span>—and 
          paradoxically, the same word means <span style={{ color: '#4ECDC4', fontWeight: '600' }}>universe</span>, 
          infinite energy. You are nothing and you are everything.
        </p>
        <p style={{
          fontSize: '14px',
          color: theme.textSecondary,
          lineHeight: '1.7',
        }}>
          That blog gave me back my parents. It gave me back my life. It gave me hope when I had none.
        </p>
      </div>

      {/* Why Zero */}
      <div style={{
        fontSize: 'clamp(16px, 4vw, 20px)',
        lineHeight: '1.7',
        color: theme.textSecondary,
        marginBottom: '40px',
      }}>
        <p>
          I chose to call myself Zero—not from lack of value or confidence, but from{' '}
          <span style={{ color: theme.text, fontWeight: '500' }}>perspective</span>. 
          When I feel I know nothing, I am nothing, that lightness opens me to more learning, 
          more failures, more progress. It gives me space to evolve, experiment, and feel.
        </p>
      </div>

      {/* Flow State Card */}
      <div style={{
        padding: 'clamp(24px, 5vw, 32px)',
        background: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: '4px',
        marginBottom: '40px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '16px',
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            letterSpacing: '1.5px',
            color: theme.accent,
          }}>
            FLOW STATE = ZERO-STATE
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: theme.textMuted,
          }}>
            scientifically proven
          </div>
        </div>

        <p style={{
          fontSize: '15px',
          lineHeight: '1.8',
          color: theme.textSecondary,
          marginBottom: '16px',
        }}>
          When you enter flow, your mind quiets the inner narrator. In neuroscience, this correlates 
          with reduced activity in self-referential networks (the "default mode") and tighter coupling 
          between attention and action.
        </p>

        <p style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '17px',
          fontStyle: 'italic',
          color: theme.text,
        }}>
          Subjectively, it feels like becoming zero: less ego-noise, fewer distractions, 
          a clean channel for execution.
        </p>

        <div style={{
          display: 'flex',
          gap: '24px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: `1px solid ${theme.border}`,
          fontFamily: "'Space Mono', monospace",
          fontSize: '11px',
          color: theme.textMuted,
        }}>
          <span>less self-talk</span>
          <span>•</span>
          <span>more signal</span>
        </div>
      </div>

      {/* Beyond Labels */}
      <div style={{
        fontSize: 'clamp(16px, 4vw, 20px)',
        lineHeight: '1.7',
        color: theme.textSecondary,
        marginBottom: '40px',
      }}>
        <p>
          Being Zero means going beyond social tags—student, founder, professional. These labels limit you. 
          Your potential is <span style={{ color: theme.accent, fontWeight: '500' }}>immense</span>. 
          Live every day as your first and last. Every day is a new birthday. Every day is a new year. 
          Every day is a new life.
        </p>
        <p style={{
          fontFamily: "'Instrument Serif', serif",
          fontStyle: 'italic',
          color: theme.text,
          marginTop: '16px',
        }}>
          The clock resets at midnight—what are you doing with that energy before it does?
        </p>
      </div>

      {/* Final Quote */}
      <div style={{
        padding: 'clamp(24px, 5vw, 40px)',
        background: 'rgba(196,120,90,0.05)',
        borderLeft: '3px solid #C4785A',
        marginBottom: '40px',
      }}>
        <p style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 'clamp(18px, 4vw, 22px)',
          fontStyle: 'italic',
          lineHeight: '1.6',
          color: theme.text,
          marginBottom: '12px',
        }}>
          "It is neither void nor universe. It is a prospect to what we are looking at."
        </p>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '11px',
          color: theme.textMuted,
        }}>
          — from the blog that changed my life, 2014
        </p>
      </div>

      {/* CTA */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '16px',
      }}>
        <a
          href={LIFE_CHANGING_BLOG_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 24px',
            background: 'transparent',
            border: `1px solid ${theme.accent}`,
            borderRadius: '980px',
            color: theme.accent,
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            letterSpacing: '0.5px',
            textDecoration: 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.accent;
            e.currentTarget.style.color = theme.bg;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = theme.accent;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Read the blog that changed my life
          <span>↗</span>
        </a>

        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '11px',
          color: theme.textMuted,
        }}>
          2014 · Zero and Infinity: from Nothing to Everything
        </span>
      </div>
    </div>
  );
};

export default ZeroInfinity;
