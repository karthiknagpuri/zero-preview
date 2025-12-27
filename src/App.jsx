import React, { useState, useEffect, useRef } from 'react';
import { useBlog } from './BlogContext';
import BlogPost from './BlogPost';
import BlogAdmin from './BlogAdmin';
import { InteractiveIndiaMap } from './components/InteractiveMap';
import { Terminal } from './components/Terminal';
import { useKeyboardShortcuts, KeyboardHelp } from './components/KeyboardShortcuts';
import BB8Toggle from './components/BB8Toggle';
import MatrixText from './components/MatrixText';
import { ZeroInfinity } from './components/ZeroInfinity';
import { VisitorCounter } from './components/VisitorCounter';
import { ContactForm } from './components/ContactForm';
import { supabase } from './supabaseClient';
import profileHeroImg from './assets/profile-hero.png';

// Custom hook for intersection observer animations
const useInView = (threshold = 0.1) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isInView];
};

// Animated section component
const AnimatedSection = ({ children, className = '', delay = 0 }) => {
  const [ref, isInView] = useInView(0.15);
  
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

// Gallery Image Carousel - auto-slides when multiple images
const GalleryImageCarousel = ({ images, title, category, theme }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 3500); // Slide every 3.5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  if (!images || images.length === 0) return null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Images container */}
      {images.map((imgUrl, idx) => (
        <img
          key={idx}
          src={imgUrl}
          alt={`${title || 'Gallery'} ${idx + 1}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: idx === currentIndex ? 1 : 0,
            transition: 'opacity 0.6s ease-in-out',
          }}
        />
      ))}

      {/* Always visible text overlay */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        padding: '16px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        zIndex: 2,
      }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '10px',
          letterSpacing: '1px',
          color: theme?.accent || '#C4785A',
          marginBottom: '4px',
        }}>
          {(category || 'PHOTO').toUpperCase()}
        </div>
        <div style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: '14px',
          color: theme?.text || '#F5F2EB',
        }}>
          {title}
        </div>
      </div>

      {/* Dots indicator - only show for multiple images */}
      {images.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '52px',
          left: '0',
          right: '0',
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          zIndex: 3,
        }}>
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: idx === currentIndex ? '16px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: idx === currentIndex ? (theme?.accent || '#C4785A') : (theme?.textMuted || 'rgba(255,255,255,0.5)'),
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Theme configuration - Apple-inspired design system
const themes = {
  dark: {
    bg: '#000000',
    bgSecondary: '#0A0A0A',
    bgTertiary: '#111111',
    bgElevated: '#1A1A1A',
    text: '#F5F5F7',
    textSecondary: '#86868B',
    textMuted: '#6E6E73',
    accent: '#C4785A',
    accentHover: '#D68B6A',
    accentBg: 'rgba(196,120,90,0.12)',
    border: 'rgba(255,255,255,0.1)',
    borderHover: 'rgba(255,255,255,0.25)',
    cardBg: 'rgba(255,255,255,0.03)',
    cardBgHover: 'rgba(255,255,255,0.06)',
    cardBorder: 'rgba(255,255,255,0.1)',
    navBg: 'rgba(0,0,0,0.85)',
    shadow: '0 2px 20px rgba(0,0,0,0.5)',
    shadowLg: '0 8px 40px rgba(0,0,0,0.6)',
    shadowSm: '0 1px 8px rgba(0,0,0,0.3)',
  },
  light: {
    bg: '#FFFFFF',
    bgSecondary: '#F5F5F7',
    bgTertiary: '#E8E8ED',
    bgElevated: '#FFFFFF',
    text: '#1D1D1F',
    textSecondary: '#6E6E73',
    textMuted: '#86868B',
    accent: '#B5634A',
    accentHover: '#A55540',
    accentBg: 'rgba(181,99,74,0.1)',
    border: 'rgba(0,0,0,0.1)',
    borderHover: 'rgba(0,0,0,0.2)',
    cardBg: '#FFFFFF',
    cardBgHover: '#F5F5F7',
    cardBorder: 'rgba(0,0,0,0.08)',
    navBg: 'rgba(255,255,255,0.85)',
    shadow: '0 2px 20px rgba(0,0,0,0.08)',
    shadowLg: '0 8px 40px rgba(0,0,0,0.12)',
    shadowSm: '0 1px 8px rgba(0,0,0,0.04)',
  }
};

export default function ZeroWebsite() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCity, setActiveCity] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);

  // Theme state with localStorage persistence
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // Default to dark
  });
  const theme = isDarkMode ? themes.dark : themes.light;

  // Blog state
  const [selectedPostId, setSelectedPostId] = useState(null);
  const { getPublishedPosts } = useBlog();
  const blogPosts = getPublishedPosts();

  // Experiences state - fetched from Supabase
  const [experiences, setExperiences] = useState([]);

  // Gallery images state - fetched from Supabase
  const [galleryImages, setGalleryImages] = useState([]);

  // Reading log state
  const [readingLogOpen, setReadingLogOpen] = useState(false);
  const [readingLogBooks, setReadingLogBooks] = useState([]);
  const [readingLogLastUpdated, setReadingLogLastUpdated] = useState(null);

  // Fallback data for experiences
  const fallbackExperiences = [
    {
      title: 'EvolveX',
      role: 'Founder & CEO (2019-Present)',
      description: 'Founder-first ecosystem infrastructure and discovery layer. Evaluated, supported, and accelerated 100+ early-stage startups across Tier-2/3 India through structured founder programs, Curated Invite-Only events, and long-term operator support.',
      status_badge: 'BUILDING',
      color: '#4ECDC4',
    },
    {
      title: 'Jagriti Yatra',
      role: 'Manager — Selections & Alumni Relations',
      description: "Co-Creating and leading selection systems, community of one of India's largest entrepreneurship platforms, evaluating thousands of applicants annually and onboarding 525 changemakers across Bharat.",
      status_badge: 'LEADING',
      color: '#C4785A',
      video_url: 'https://www.linkedin.com/embed/feed/update/urn:li:activity:7256892510436802560',
    },
    {
      title: 'EdVenture Park',
      role: 'Incubation Manager Fellow',
      description: 'Supporting 12+ startups with follow-on funding. Learning ecosystem building from the ground up.',
      status_badge: 'ENABLING',
      color: '#FFE66D',
    },
    {
      title: 'Nexteen',
      role: 'CTO & Co-Founder',
      description: 'Tech infrastructure connecting teenagers with real-world opportunities and innovation programs.',
      status_badge: 'TOOK EXIT',
      color: '#9B59B6',
      video_url: 'https://www.youtube.com/embed/REd3f2BdVwE?start=143',
    },
  ];

  // Fetch experiences from Supabase
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const { data, error } = await supabase
          .from('experiences')
          .select('*')
          .eq('type', 'current')
          .eq('is_visible', true)
          .order('display_order', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setExperiences(data);
        } else {
          setExperiences(fallbackExperiences);
        }
      } catch (error) {
        console.log('Using fallback experiences:', error);
        setExperiences(fallbackExperiences);
      }
    };

    fetchExperiences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fallback data for gallery images
  const fallbackGalleryImages = [
    { id: 1, title: 'TEDx CMRIT Hyderabad', caption: 'Speaking at TEDx', category: 'Speaking' },
    { id: 2, title: 'Jagriti Yatra 2023', caption: 'Train journey across India', category: 'Journey' },
    { id: 3, title: 'EvolveX Demo Day', caption: 'Startup demo day', category: 'Events' },
    { id: 4, title: 'Founder Circle Meetup', caption: 'Community gathering', category: 'Community' },
    { id: 5, title: 'Draper Startup House', caption: 'Partner event', category: 'Partners' },
    { id: 6, title: 'Rural India Expedition', caption: 'Exploring rural India', category: 'Journey' },
  ];

  // Fetch gallery images from Supabase
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .eq('is_visible', true)
          .order('display_order', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setGalleryImages(data);
        } else {
          setGalleryImages(fallbackGalleryImages);
        }
      } catch (error) {
        console.log('Using fallback gallery images:', error);
        setGalleryImages(fallbackGalleryImages);
      }
    };

    fetchGalleryImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch reading log from Supabase
  useEffect(() => {
    const fetchReadingLog = async () => {
      try {
        const { data, error } = await supabase
          .from('reading_log')
          .select('*')
          .eq('is_visible', true)
          .order('date_read', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setReadingLogBooks(data);
          // Get the most recent update time
          const latestUpdate = data.reduce((latest, book) => {
            const bookDate = new Date(book.updated_at || book.created_at);
            return bookDate > latest ? bookDate : latest;
          }, new Date(0));
          setReadingLogLastUpdated(latestUpdate);
        }
      } catch (error) {
        console.log('Reading log not available:', error);
      }
    };

    fetchReadingLog();
  }, []);

  // Theme toggle handler
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  // Terminal focus for keyboard shortcut
  const focusTerminal = () => {
    const terminalInput = document.querySelector('.terminal-input');
    if (terminalInput) terminalInput.focus();
  };

  // Keyboard shortcuts
  const { showHelp, setShowHelp } = useKeyboardShortcuts({
    onToggleTheme: toggleTheme,
    onFocusTerminal: focusTerminal,
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((scrollTop / docHeight) * 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active view state: 'landing' for main page, 'terminal' for terminal tab
  const [activeView, setActiveView] = useState('landing');

  const sections = [
    { id: 'terminal', label: 'TERMINAL', isTab: true },
    { id: 'now', label: 'NOW' },
    { id: 'past', label: 'JOURNEY' },
    { id: 'geography', label: 'MAP' },
    { id: 'writing', label: 'BLOG' },
    { id: 'gallery', label: 'GALLERY' },
    { id: 'vibes', label: 'VIBES' },
    { id: 'connect', label: 'CONTACT' },
  ];


  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle navigation click - switch view for tabs, scroll for sections
  const handleNavClick = (section) => {
    if (section.isTab) {
      setActiveView(section.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (activeView !== 'landing') {
        setActiveView('landing');
        // Wait for view switch, then scroll
        setTimeout(() => scrollToSection(section.id), 100);
      } else {
        scrollToSection(section.id);
      }
    }
  };

  // currentProjects is now loaded from Supabase (experiences state)

  const fellowships = [
    { name: 'Emergent Ventures', org: 'Mercatus Center, GMU' },
    { name: 'Kairos Founding Fellow', org: '<5% acceptance rate' },
    { name: 'Suzuki Fellow', org: 'Innovation Grant' },
    { name: '25 Under 25', org: 'India Recognition' },
  ];

  const mapStats = [
    { label: 'Founders to Empower', value: '10K+' },
    { label: 'Community Members', value: '10.5K+' },
    { label: 'Startups Collaborated', value: '15+' },
    { label: 'Governments Worked With', value: '4' },
  ];

  return (
    <div style={{
      fontFamily: "'Source Serif 4', Georgia, serif",
      background: theme.bg,
      color: theme.text,
      minHeight: '100vh',
      position: 'relative',
      overflowX: 'hidden',
      transition: 'background 0.3s ease, color 0.3s ease',
    }}>

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        ::selection {
          background: ${theme.accent};
          color: ${isDarkMode ? '#0D0D0D' : '#FFFFFF'};
        }

        html {
          scroll-behavior: smooth;
          -webkit-text-size-adjust: 100%;
        }

        body {
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }

        @keyframes trainMove {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -400; }
        }

        /* Hide grain on mobile for performance */
        .grain-overlay {
          display: none;
        }

        @media (min-width: 768px) {
          .grain-overlay {
            display: block;
            position: fixed;
            top: -50%;
            left: -50%;
            right: -50%;
            bottom: -50%;
            width: 200%;
            height: 200%;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
            opacity: 0.04;
            pointer-events: none;
            z-index: 1000;
          }
        }

        /* Navigation - Mobile First */
        .nav-desktop { display: none; }

        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          padding: 8px;
          min-height: 44px;
          min-width: 44px;
          justify-content: center;
          align-items: center;
          -webkit-tap-highlight-color: transparent;
        }

        .hamburger span {
          display: block;
          width: 20px;
          height: 2px;
          background: ${theme.text};
          transition: all 0.3s ease;
        }

        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }

        .mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${theme.bg};
          z-index: 99;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 32px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .mobile-menu.open {
          opacity: 1;
          visibility: visible;
        }

        .mobile-menu-item {
          font-family: 'Space Mono', monospace;
          font-size: 14px;
          letter-spacing: 3px;
          color: ${theme.textSecondary};
          cursor: pointer;
          padding: 16px 24px;
          min-height: 48px;
          transition: color 0.3s ease;
          text-transform: uppercase;
        }

        .mobile-menu-item:active {
          color: ${theme.accent};
        }

        @media (min-width: 768px) {
          .nav-desktop { display: flex; }
          .hamburger { display: none; }
        }

        .nav-item {
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 8px 0;
          min-height: 44px;
          display: flex;
          align-items: center;
        }

        .nav-item::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 0;
          width: 0;
          height: 1px;
          background: ${theme.accent};
          transition: width 0.3s ease;
        }

        @media (hover: hover) {
          .nav-item:hover::after {
            width: 100%;
          }
        }

        /* Project Cards - Apple-style */
        .project-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border-radius: 16px;
        }

        @media (hover: hover) {
          .project-card:hover {
            transform: translateY(-2px);
            box-shadow: ${theme.shadow};
          }
        }

        /* Section padding - Apple-style generous whitespace */
        .section-padding {
          padding: clamp(80px, 15vh, 160px) max(24px, 5vw);
        }

        /* Social Links - Apple-style */
        .social-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 20px;
          min-height: 44px;
          border: 1px solid ${theme.border};
          border-radius: 980px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          color: ${theme.textSecondary};
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
          font-size: 14px;
          font-weight: 400;
          background: transparent;
        }

        .social-link:active {
          transform: scale(0.98);
          background: ${theme.bgTertiary};
        }

        @media (hover: hover) {
          .social-link:hover {
            border-color: ${theme.borderHover};
            color: ${theme.text};
            background: ${theme.bgTertiary};
            transform: translateY(-1px);
          }
        }

        /* Map Tabs - Apple-style */
        .map-tab {
          padding: 10px 20px;
          min-height: 40px;
          background: transparent;
          border: 1px solid ${theme.border};
          border-radius: 980px;
          color: ${theme.textMuted};
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .map-tab.active {
          background: ${theme.accent};
          border-color: ${theme.accent};
          color: #fff;
        }

        @media (hover: hover) {
          .map-tab:not(.active):hover {
            background: ${theme.bgTertiary};
            border-color: ${theme.borderHover};
          }
        }

        /* CTA Button */
        .cta-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          min-height: 56px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        /* Vibe Tags */
        .vibe-tag {
          display: inline-block;
          padding: 10px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        /* Section containers - Mobile first */
        .section-padding {
          padding: 80px 20px;
        }

        @media (min-width: 768px) {
          .section-padding {
            padding: 120px 40px;
          }
        }

        @media (min-width: 1024px) {
          .section-padding {
            padding: 160px 48px;
          }
        }

        /* Grid layouts - Mobile first */
        .grid-2-col {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        @media (min-width: 640px) {
          .grid-2-col {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
        }

        .grid-4-col {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (min-width: 768px) {
          .grid-4-col {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }

        /* Past section layout */
        .past-grid {
          display: block;
        }

        @media (min-width: 900px) {
          .past-grid {
            display: grid;
            grid-template-columns: 180px 1fr;
            gap: 60px;
          }
        }

        /* Map section layout */
        .map-grid {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        @media (min-width: 900px) {
          .map-grid {
            display: grid;
            grid-template-columns: 1fr 320px;
            gap: 40px;
          }
        }

        /* Floating element - hide on mobile */
        .floating-text {
          display: none;
        }

        @media (min-width: 1024px) {
          .floating-text {
            display: block;
          }
        }

        /* Scroll indicator - hide on mobile */
        .scroll-indicator {
          display: none;
        }

        @media (min-width: 768px) {
          .scroll-indicator {
            display: flex;
          }
        }

        /* Hero section responsive */
        .hero-container {
          flex-direction: column-reverse;
          gap: 40px;
          text-align: center;
        }

        .hero-container .hero-text {
          align-items: center;
        }

        .hero-container .hero-image img {
          width: clamp(200px, 50vw, 280px);
        }

        @media (min-width: 768px) {
          .hero-container {
            flex-direction: row;
            gap: 60px;
            text-align: left;
          }

          .hero-container .hero-text {
            align-items: flex-start;
          }

          .hero-container .hero-image img {
            width: clamp(280px, 30vw, 420px);
          }
        }

        /* Typography responsive */
        .hero-title {
          font-size: clamp(48px, 15vw, 180px);
        }

        .section-title {
          font-size: clamp(32px, 8vw, 48px);
        }

        .connect-title {
          font-size: clamp(40px, 10vw, 64px);
        }

        /* Footer responsive */
        @media (min-width: 640px) {
          footer {
            flex-direction: row !important;
            justify-content: space-between !important;
            text-align: left !important;
            padding: 40px !important;
          }
        }

        /* Touch-friendly interactive elements */
        @media (max-width: 767px) {
          .project-card {
            -webkit-tap-highlight-color: transparent;
          }

          .map-tab {
            flex: 1;
            text-align: center;
          }
        }

        /* Safe area for notched phones */
        @supports (padding: max(0px)) {
          .section-padding {
            padding-left: max(20px, env(safe-area-inset-left));
            padding-right: max(20px, env(safe-area-inset-right));
          }
        }

        /* Animated counter */
        @keyframes countUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Marquee animation */
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .marquee-container {
          overflow: hidden;
          white-space: nowrap;
        }

        .marquee-content {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }

        /* Glowing border effect */
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(196,120,90,0.3); }
          50% { border-color: rgba(196,120,90,0.6); }
        }

        .glow-border {
          animation: borderGlow 3s ease infinite;
        }

        .image-placeholder {
          background: rgba(255,255,255,0.05);
        }

        /* Magnetic button effect */
        .magnetic-btn {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Accent text - no gradient */
        .accent-text {
          color: #C4785A;
        }

        /* Typing cursor */
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .typing-cursor::after {
          content: '|';
          animation: blink 1s infinite;
          color: #C4785A;
        }

        /* Card 3D tilt effect */
        .tilt-card {
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }

        /* Stagger animation for lists */
        .stagger-item {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeIn 0.5s ease forwards;
        }

        /* Photo gallery */
        .gallery-item {
          position: relative;
          overflow: hidden;
        }

        .gallery-item:hover .gallery-overlay {
          transform: translateY(0);
        }

        @media (max-width: 640px) {
          .gallery-item .gallery-overlay {
            transform: translateY(0);
            position: relative;
            background: transparent;
            padding: 8px 0 0;
          }

          .gallery-grid {
            grid-template-columns: 1fr !important;
          }

          .gallery-grid .gallery-item {
            grid-column: span 1 !important;
            aspect-ratio: 16/10 !important;
          }
        }

        /* Testimonial card */
        .testimonial-card {
          position: relative;
        }

        .testimonial-card::before {
          content: '"';
          position: absolute;
          top: -20px;
          left: 20px;
          font-size: 80px;
          font-family: 'Instrument Serif', serif;
          color: rgba(196,120,90,0.2);
          line-height: 1;
        }

        /* Badge pulse */
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(78,205,196,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(78,205,196,0); }
        }

        .badge-pulse {
          animation: badgePulse 2s ease infinite;
        }

        /* Scroll-triggered reveal */
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .reveal-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Reduced motion support for accessibility */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }

          .reveal-on-scroll {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <div className="grain-overlay" />

      {/* Progress Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '2px',
        width: `${scrollProgress}%`,
        background: '#C4785A',
        zIndex: 1001,
        transition: 'width 0.1s linear',
      }} />

      {/* Navigation - Apple-style */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '0 max(24px, env(safe-area-inset-left))',
        height: '52px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        background: theme.navBg,
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: `0.5px solid ${theme.border}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '22px',
          fontStyle: 'italic',
          letterSpacing: '-0.5px',
          cursor: 'pointer',
          color: theme.text,
          fontWeight: '400',
          transition: 'opacity 0.2s ease',
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Zero
        </div>

        <div className="nav-desktop" style={{
          gap: '32px',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
          fontSize: '12px',
          fontWeight: '400',
          letterSpacing: '0.5px',
        }}>
          {sections.map((section) => (
            <span
              key={section.id}
              className="nav-item"
              onClick={() => handleNavClick(section)}
              style={{
                color: activeView === section.id ? theme.accent : theme.textSecondary,
                fontWeight: activeView === section.id ? '600' : '400',
              }}
            >
              {section.label}
            </span>
          ))}
        </div>

        {/* Desktop: Theme Toggle + CTA */}
        <div className="nav-desktop" style={{ gap: '16px', alignItems: 'center' }}>
          {/* Reading Log Icon */}
          <button
            onClick={() => setReadingLogOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: theme.textSecondary,
              transition: 'color 0.2s ease',
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
              fontSize: '11px',
              fontWeight: '500',
              letterSpacing: '0.5px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.textSecondary;
            }}
            title="Reading Log"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            READING
          </button>
          <div style={{ transform: 'scale(0.25)', transformOrigin: 'center', marginRight: '-60px' }}>
            <BB8Toggle 
              checked={!isDarkMode} 
              onChange={toggleTheme}
            />
          </div>
          <a
            href="mailto:nanikarthik98@gmail.com"
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
              fontSize: '12px',
              fontWeight: '500',
              color: isDarkMode ? '#fff' : '#fff',
              textDecoration: 'none',
              padding: '8px 16px',
              background: theme.accent,
              borderRadius: '980px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.accentHover;
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.accent;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Say Hi
          </a>
        </div>

        {/* Mobile: Hamburger */}
        <div
          className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}
        style={{ background: theme.bg }}
      >
        {sections.map((section) => (
          <div
            key={section.id}
            className="mobile-menu-item"
            style={{
              color: activeView === section.id ? theme.accent : theme.textSecondary,
              fontWeight: activeView === section.id ? '600' : '400',
            }}
            onClick={() => {
              handleNavClick(section);
              setMobileMenuOpen(false);
            }}
          >
            {section.label}
          </div>
        ))}
        <a
          href="mailto:nanikarthik98@gmail.com"
          className="mobile-menu-item"
          style={{ color: theme.accent, marginTop: '16px' }}
          onClick={() => setMobileMenuOpen(false)}
        >
          SAY HI →
        </a>
        {/* Mobile Reading Log */}
        <button
          onClick={() => {
            setReadingLogOpen(true);
            setMobileMenuOpen(false);
          }}
          className="mobile-menu-item"
          style={{
            background: 'none',
            border: 'none',
            color: theme.textSecondary,
            marginTop: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          📚 Reading Log
        </button>
        {/* Mobile Theme Toggle */}
        <button
          onClick={() => {
            toggleTheme();
            setMobileMenuOpen(false);
          }}
          className="mobile-menu-item"
          style={{
            background: 'none',
            border: 'none',
            color: theme.textSecondary,
            marginTop: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {/* Reading Log Modal */}
      {readingLogOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '60px 20px 20px',
            overflowY: 'auto',
          }}
          onClick={() => setReadingLogOpen(false)}
        >
          <div
            style={{
              background: theme.bgElevated,
              border: `1px solid ${theme.border}`,
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: 'calc(100vh - 100px)',
              overflow: 'hidden',
              boxShadow: theme.shadowLg,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <div>
                  <h2 style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.text,
                    margin: 0,
                  }}>
                    reading log
                  </h2>
                  {readingLogLastUpdated && (
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      color: theme.textMuted,
                    }}>
                      (last updated: {readingLogLastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })})
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setReadingLogOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: theme.textMuted,
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    fontSize: '20px',
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Books List */}
            <div style={{
              maxHeight: 'calc(100vh - 200px)',
              overflowY: 'auto',
              padding: '8px 0',
            }}>
              {readingLogBooks.length === 0 ? (
                <div style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '13px',
                  color: theme.textMuted,
                }}>
                  No books in reading log yet.
                </div>
              ) : (
                readingLogBooks.map((book) => (
                  <div
                    key={book.id}
                    style={{
                      padding: '16px 24px',
                      borderBottom: `1px solid ${theme.border}`,
                    }}
                  >
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '14px',
                      fontWeight: '500',
                      color: theme.accent,
                      marginBottom: '4px',
                      lineHeight: '1.4',
                    }}>
                      {book.title.toLowerCase()}
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '12px',
                      color: theme.textMuted,
                      marginBottom: '6px',
                    }}>
                      by {book.author.toLowerCase()}
                      {book.date_read && ` · ${new Date(book.date_read).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`}
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '12px',
                      color: theme.textMuted,
                    }}>
                      {book.status === 'reading' ? (
                        <span style={{ color: theme.accent }}>currently reading</span>
                      ) : book.rating ? (
                        <span>{'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)} {book.rating} stars</span>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Terminal View - Separate Tab */}
      {activeView === 'terminal' && (
        <section style={{
          minHeight: 'calc(100vh - 80px)',
          padding: '120px max(24px, 5vw) 80px',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}>
              <div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  letterSpacing: '2px',
                  color: '#C4785A',
                  marginBottom: '8px',
                }}>
                  INTERACTIVE TERMINAL
                </div>
                <h1 style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontWeight: '400',
                  fontStyle: 'italic',
                  fontSize: 'clamp(32px, 6vw, 48px)',
                  color: theme.text,
                }}>
                  Talk to Zero
                </h1>
              </div>
              <button
                onClick={() => setActiveView('landing')}
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  color: theme.textSecondary,
                  background: 'none',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.accent;
                  e.currentTarget.style.color = theme.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.border;
                  e.currentTarget.style.color = theme.textSecondary;
                }}
              >
                ← Back to Home
              </button>
            </div>
            <Terminal theme={theme} onToggleTheme={toggleTheme} />
          </div>
        </section>
      )}

      {/* Landing Page Content */}
      {activeView === 'landing' && (
      <>
      {/* Hero Section - Apple-style */}
      <section style={{
        minHeight: 'max(100vh, 100dvh)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '120px max(24px, 5vw) 80px',
        position: 'relative',
      }}>
        <div className="hero-container" style={{
          maxWidth: '1200px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}>
          {/* Left side - Text content */}
          <div className="hero-text" style={{ flex: '1', minWidth: '280px', maxWidth: '680px', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '12px',
            marginBottom: '24px',
            animation: 'fadeIn 0.8s ease forwards',
            flexWrap: 'wrap',
          }}>
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
            }}>
              <span style={{ fontSize: '24px' }}>👋</span>
              <span style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                fontSize: '14px',
                color: theme.textSecondary,
                fontWeight: '400',
              }}>
                Hey, I'm
              </span>
            </span>
            <span className="hero-title" style={{
              fontFamily: "'Instrument Serif', serif",
              fontWeight: '400',
              fontStyle: 'italic',
              lineHeight: '1',
              color: theme.text,
              letterSpacing: '-2px',
            }}>
              <MatrixText 
                defaultText="Zero" 
                hoverText="Karthik Nagapuri"
              />
            </span>
          </div>

          <div style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            fontSize: '13px',
            letterSpacing: '0.5px',
            color: theme.textMuted,
            marginBottom: '32px',
            animation: 'fadeIn 0.8s ease 0.3s forwards',
            opacity: 0,
            animationFillMode: 'forwards',
            fontWeight: '500',
          }}>
            Karthik Nagapuri · Hyderabad 🏠
          </div>

          <p style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            fontSize: 'clamp(18px, 3.5vw, 28px)',
            lineHeight: '1.4',
            maxWidth: '100%',
            color: theme.textSecondary,
            fontWeight: '400',
            animation: 'fadeIn 0.8s ease 0.45s forwards',
            opacity: 0,
            animationFillMode: 'forwards',
            letterSpacing: '-0.3px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}>
            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              <span style={{ 
                color: theme.textMuted, 
                fontWeight: '600', 
                textDecoration: 'line-through',
                textDecorationColor: theme.accent,
                opacity: 0.6,
              }}>Founder</span>
              <svg 
                width="24" 
                height="16" 
                viewBox="0 0 24 16" 
                fill="none" 
                style={{ marginLeft: '2px', marginRight: '2px', flexShrink: 0 }}
              >
                <path 
                  d="M2 8C2 8 6 2 12 8C18 14 22 8 22 8" 
                  stroke={theme.accent} 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  fill="none"
                />
                <path 
                  d="M18 5L22 8L18 11" 
                  stroke={theme.accent} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </span>
            <span style={{ color: theme.text, fontWeight: '600' }}>Builder</span> · <span style={{ color: theme.text, fontWeight: '600' }}>Ecosystem Investor</span>
            <br />
            <span style={{ fontSize: 'clamp(13px, 3vw, 17px)', marginTop: '12px', display: 'block', lineHeight: '1.7', color: theme.textSecondary }}>
              Designing platforms, selection systems, and founder-first infrastructure across Bharat.
            </span>
            <span style={{ fontSize: 'clamp(13px, 3vw, 17px)', marginTop: '8px', display: 'block', lineHeight: '1.7', fontStyle: 'italic' }}>
              Technology should democratize opportunity, not concentrate it.
            </span>
          </p>

          {/* Social Links - Stack on mobile */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '32px',
            animation: 'fadeIn 0.8s ease 0.8s forwards',
            opacity: 0,
            animationFillMode: 'forwards',
          }}>
            <a href="https://www.linkedin.com/in/karthiknagpuri" target="_blank" rel="noopener noreferrer" className="social-link">
              <span>LinkedIn</span>
              <span>↗</span>
            </a>
            <a href="mailto:nanikarthik98@gmail.com" className="social-link">
              <span>Email</span>
              <span>↗</span>
            </a>
            <a href="tel:+916305458955" className="social-link">
              <span>Call</span>
              <span>↗</span>
            </a>
          </div>
          </div>

          {/* Right side - Profile Image */}
          <div className="hero-image" style={{
            flex: '0 0 auto',
            animation: 'fadeIn 1s ease 0.6s forwards',
            opacity: 0,
            animationFillMode: 'forwards',
            position: 'relative',
          }}>
            <img
              src={profileHeroImg}
              alt="Karthik Nagapuri"
              style={{
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 60px rgba(196, 120, 90, 0.15))',
                maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
              }}
            />
          </div>
        </div>

        <div className="scroll-indicator" style={{
          position: 'absolute',
          bottom: '40px',
          left: 'max(24px, 5vw)',
          alignItems: 'center',
          gap: '12px',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
          fontSize: '11px',
          fontWeight: '500',
          color: theme.textMuted,
          letterSpacing: '0.5px',
          animation: 'pulse 2s ease infinite',
        }}>
          <div style={{
            width: '32px',
            height: '1px',
            background: theme.textMuted,
          }} />
          SCROLL
        </div>
      </section>

      {/* Interactive Map Section */}
      <section id="now" className="section-padding" style={{
        borderTop: `1px solid ${theme.border}`,
      }}>
        <AnimatedSection>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              letterSpacing: '2px',
              color: theme.accent,
              marginBottom: '16px',
            }}>
              NOW
            </div>

            <h2 className="section-title" style={{
              fontFamily: "'Instrument Serif', serif",
              fontWeight: '400',
              fontStyle: 'italic',
              marginBottom: '40px',
            }}>
              Currently building...
            </h2>

            <div className="grid-2-col">
              {experiences.map((project, index) => (
                <div
                  key={project.id || index}
                  className="project-card"
                  onMouseEnter={() => setHoveredProject(index)}
                  onMouseLeave={() => setHoveredProject(null)}
                  style={{
                    padding: 'clamp(24px, 5vw, 40px)',
                    background: hoveredProject === index
                      ? `${project.color}10`
                      : theme.cardBg,
                    border: `1px solid ${hoveredProject === index ? project.color + '40' : theme.cardBorder}`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Status badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '8px',
                    letterSpacing: '1px',
                    color: project.color,
                    padding: '4px 8px',
                    background: `${project.color}15`,
                    borderRadius: '2px',
                  }}>
                    {project.status_badge}
                  </div>

                  <h3 style={{
                    fontSize: 'clamp(22px, 5vw, 28px)',
                    fontWeight: '400',
                    marginBottom: '8px',
                    color: hoveredProject === index ? project.color : theme.text,
                    transition: 'color 0.3s ease',
                    paddingRight: '60px',
                  }}>
                    {project.title}
                  </h3>

                  <div style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: '14px',
                    fontStyle: 'italic',
                    color: theme.textMuted,
                    marginBottom: '16px',
                  }}>
                    {project.role}
                  </div>

                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: theme.textSecondary,
                    marginBottom: project.video_url ? '16px' : '0',
                  }}>
                    {project.description}
                  </p>

                  {/* Video embed if available */}
                  {project.video_url && (
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      paddingBottom: '56.25%',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: theme.bgTertiary,
                      marginTop: '8px',
                    }}>
                      <iframe
                        src={project.video_url}
                        title={`${project.title} Video`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none',
                        }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {/* External link button if available */}
                  {project.link_url && (
                    <a
                      href={project.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '12px',
                        padding: '8px 14px',
                        background: theme.accentBg,
                        color: theme.accent,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontFamily: "'Space Mono', monospace",
                        textDecoration: 'none',
                        border: `1px solid ${theme.accent}`,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.accent;
                        e.currentTarget.style.color = theme.bg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme.accentBg;
                        e.currentTarget.style.color = theme.accent;
                      }}
                    >
                      {project.link_label || 'View More'} ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Past Section */}
      <section id="past" className="section-padding" style={{
        background: theme.accentBg,
        borderTop: `1px solid ${theme.border}`,
      }}>
        <AnimatedSection>
          <div className="past-grid" style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              letterSpacing: '2px',
              color: theme.accent,
              marginBottom: '24px',
            }}>
              JOURNEY
            </div>
            
            <div>
              <h2 className="section-title" style={{
                fontFamily: "'Instrument Serif', serif",
                fontWeight: '400',
                fontStyle: 'italic',
                marginBottom: '32px',
              }}>
                The journey so far
              </h2>



              {/* Origin Story */}
              <div style={{
                padding: 'clamp(20px, 5vw, 40px)',
                background: 'rgba(78,205,196,0.05)',
                borderLeft: '3px solid #4ECDC4',
                marginBottom: '32px',
              }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '2px',
                  color: '#4ECDC4',
                  marginBottom: '16px',
                }}>
                  ORIGIN STORY · RURAL TELANGANA
                </div>
                <p style={{
                  fontSize: 'clamp(16px, 4vw, 20px)',
                  lineHeight: '1.6',
                  marginBottom: '16px',
                }}>
                  From a <span style={{ color: '#4ECDC4', fontWeight: '600' }}>rural farming family</span> in Telangana to building founder-first ecosystems across Bharat. The journey from village beginnings shaped my belief that the next unicorn can come from anywhere.
                </p>
              </div>

              {/* TEDx Highlight */}
              <div style={{
                padding: 'clamp(20px, 5vw, 40px)',
                background: 'rgba(196,120,90,0.05)',
                borderLeft: '3px solid #C4785A',
                marginBottom: '32px',
              }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '2px',
                  color: '#C4785A',
                  marginBottom: '16px',
                }}>
                  TEDX CMRIT HYDERABAD
                </div>
                <p style={{
                  fontSize: 'clamp(16px, 4vw, 20px)',
                  lineHeight: '1.6',
                  marginBottom: '16px',
                }}>
                  "Building Integrated Communities with Zero Mindset" — discussing the journey from rural villages to scaling{' '}
                  <span style={{ color: theme.accent, fontWeight: '600' }}>national-scale initiatives</span>.
                </p>
                <p style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: '14px',
                  fontStyle: 'italic',
                  color: theme.textMuted,
                  marginBottom: '24px',
                }}>
                  Zero isn't nothing — it's infinite possibility. The origin point from which everything begins.
                </p>

                {/* TEDx YouTube Video */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  paddingBottom: '56.25%',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: theme.bgTertiary,
                }}>
                  <iframe
                    src="https://www.youtube.com/embed/CTuljx86jPU"
                    title="TEDx Talk - Building Integrated Communities with Zero Mindset"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Timeline items */}
              <div style={{
                display: 'grid',
                gap: '24px',
              }}>
                {[
                  { icon: '🔐', text: 'SafeBlock — CTO & Founder · End-to-end crypto nominee system preventing digital asset loss' },
                  { icon: '🚽', text: 'LooCafé/Ixora Group — Head of Technology · "Most Innovative Company" by CII, UNDP Best Practice' },
                  { icon: '📖', text: 'LiteraZe Society — Technical Lead · Literacy and education initiatives (2019-2023)' },
                  { icon: '🎯', text: 'FeatureIndia — Chief Technology Officer' },
                  { icon: '📝', text: 'TextHappen Content — Senior Director of Operations' },
                  { icon: '🎓', text: 'Google DSC Core Team · Coding Cubs VP · Led 5+ organizations' },
                  { icon: '🤖', text: 'Technical: AI/ML, DeFi, Blockchain, Full-Stack Development, Solution Architecture' },
                ].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start',
                    padding: '16px 0',
                    borderBottom: `1px solid ${theme.border}`,
                  }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <span style={{ fontSize: '16px', color: theme.textSecondary, lineHeight: '1.6' }}>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Fellowships */}
              <div style={{ marginTop: '48px' }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '2px',
                  color: theme.textMuted,
                  marginBottom: '20px',
                }}>
                  🎯 FELLOWSHIPS & RECOGNITION
                </div>
                <div className="grid-2-col">
                  {fellowships.map((fellowship, index) => (
                    <div key={index} style={{
                      padding: '20px',
                      background: theme.cardBg,
                      border: `1px solid ${theme.cardBorder}`,
                    }}>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '13px',
                        color: theme.text,
                        marginBottom: '4px',
                      }}>
                        {fellowship.name}
                      </div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        color: theme.textMuted,
                      }}>
                        {fellowship.org}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div style={{ marginTop: '48px' }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '2px',
                  color: theme.textMuted,
                  marginBottom: '24px',
                }}>
                  🎓 EDUCATION
                </div>
                <div style={{
                  padding: '20px',
                  background: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                }}>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    color: theme.text,
                    marginBottom: '4px',
                  }}>
                    B.Tech in Artificial Intelligence
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    color: theme.textMuted,
                  }}>
                    Anurag University · Kairos School of Business Fellow
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Zero to Infinity Section */}
      <section className="section-padding" style={{
        borderTop: `1px solid ${theme.border}`,
      }}>
        <AnimatedSection>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <ZeroInfinity theme={theme} />
          </div>
        </AnimatedSection>
      </section>

      {/* Interactive Map Section */}
      <section id="geography" className="section-padding" style={{
        borderTop: `1px solid ${theme.border}`,
        background: theme.bgSecondary,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <AnimatedSection>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            position: 'relative',
          }}>
            {/* Header with tabs - stack on mobile */}
            <div style={{
              marginBottom: '32px',
            }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                letterSpacing: '2px',
                color: theme.accent,
                marginBottom: '16px',
              }}>
                MAP
              </div>

              <h2 className="section-title" style={{
                fontFamily: "'Instrument Serif', serif",
                fontWeight: '400',
                fontStyle: 'italic',
                marginBottom: '24px',
              }}>
                Where the work happens
              </h2>

                          </div>

            {/* Stats Row */}
            <div className="grid-4-col" style={{
              marginBottom: '32px',
            }}>
              {mapStats.map((stat, index) => (
                <div key={index} style={{
                  textAlign: 'center',
                  padding: 'clamp(16px, 4vw, 24px)',
                  background: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                }}>
                  <div style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 'clamp(24px, 6vw, 36px)',
                    color: theme.accent,
                    marginBottom: '4px',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '9px',
                    letterSpacing: '1px',
                    color: theme.textMuted,
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Map Container */}
            <div className="map-grid" style={{
              alignItems: 'start',
            }}>
              <div style={{
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                padding: 'clamp(12px, 3vw, 24px)',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
                <InteractiveIndiaMap activeState={activeCity} setActiveState={setActiveCity} theme={theme} />

                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '9px',
                  letterSpacing: '1px',
                  color: theme.textMuted,
                }}>
                  HOVER TO EXPLORE · CLICK FOR DETAILS
                </div>
              </div>

              <div>
                <h3 style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 'clamp(20px, 5vw, 24px)',
                  fontStyle: 'italic',
                  marginBottom: '20px',
                  color: theme.text,
                }}>
                  The 5-Year Vision
                </h3>

                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: theme.textSecondary,
                  marginBottom: '24px',
                }}>
                  Democratizing AI and innovation across India. Ensuring every aspiring entrepreneur has access to mentorship, funding, and community — regardless of background or location.
                </p>

                <div style={{
                  padding: 'clamp(16px, 4vw, 24px)',
                  background: 'rgba(78,205,196,0.05)',
                  borderLeft: '2px solid #4ECDC4',
                  marginBottom: '24px',
                }}>
                  <p style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: '15px',
                    fontStyle: 'italic',
                    marginBottom: '8px',
                  }}>
                    "Empower 10,000+ founders, create 100+ sustainable startups, and prove that the next unicorn can come from anywhere in Bharat."
                  </p>
                  <p style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    color: '#4ECDC4',
                  }}>
                    1825 DAYS TO GO
                  </p>
                </div>

                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                }}>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#4ECDC4' }}>●</span> Teal = Home (Hyderabad)
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#ff6b35' }}>●</span> Orange = Active Ecosystem
                  </div>
                  <div>
                    <span style={{ color: '#F5E6D3' }}>●</span> Beige = Emerging
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Vibes Section */}
      <section id="vibes" className="section-padding" style={{
        borderTop: `1px solid ${theme.border}`,
      }}>
        <AnimatedSection>
          <div className="past-grid" style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              letterSpacing: '2px',
              color: theme.accent,
              marginBottom: '24px',
            }}>
              VIBES
            </div>

            <div>
              <h2 className="section-title" style={{
                fontFamily: "'Instrument Serif', serif",
                fontWeight: '400',
                fontStyle: 'italic',
                marginBottom: '32px',
                color: theme.text,
              }}>
                When I'm not working
              </h2>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '32px',
              }}>
                {[
                  { emoji: '📚', text: 'Obsessive Reader' },
                  { emoji: '☕', text: 'Coffee Chats' },
                  { emoji: '🎬', text: 'Films & Stories' },
                  { emoji: '🤖', text: 'AI Tinkering' },
                  { emoji: '🎯', text: 'Founder Circles' },
                  { emoji: '🏋️', text: 'Lifting Weights' },
                  { emoji: '🎧', text: 'Podcasts' },
                  { emoji: '🥾', text: '12-Hour Walks' },
                ].map((vibe, index) => (
                  <span key={index} className="vibe-tag">
                    {vibe.emoji} {vibe.text}
                  </span>
                ))}
              </div>

              <div style={{
                padding: 'clamp(20px, 5vw, 40px)',
                background: 'rgba(78,205,196,0.05)',
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '4px',
                marginBottom: '24px',
              }}>
                <p style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 'clamp(16px, 4vw, 20px)',
                  fontStyle: 'italic',
                  lineHeight: '1.6',
                  marginBottom: '16px',
                  color: theme.text,
                }}>
                  Known for hyper-structured yet informal events — tightly designed agendas with{' '}
                  <span style={{ color: '#4ECDC4' }}>spontaneous serendipity</span>, random pairings, and "accidental collisions" between founders and investors.
                </p>
                <p style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  color: theme.textMuted,
                }}>
                  People often mention the "energy in the room" and how I remember individuals and connect them to exactly the right person.
                </p>
              </div>

              <div style={{
                padding: 'clamp(20px, 5vw, 40px)',
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '4px',
              }}>
                <p style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 'clamp(16px, 4vw, 20px)',
                  fontStyle: 'italic',
                  lineHeight: '1.6',
                  marginBottom: '12px',
                  color: theme.text,
                }}>
                  Even as an AI engineer, I position myself more as a{' '}
                  <span style={{ color: theme.accent }}>"connector of humans"</span> than a pure techie — preferring whiteboards, coffee chats, and founder circles over shipping code in isolation.
                </p>
              </div>

              {/* Signature */}
              <div style={{
                marginTop: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: theme.textMuted,
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
              }}>
                <span style={{ fontSize: '20px' }}>📚</span>
                <span>Books shaped my thinking more than formal education</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Photo Gallery Section */}
      <section id="gallery" className="section-padding" style={{
        background: theme.bgSecondary,
        borderTop: `1px solid ${theme.border}`,
      }}>
        <AnimatedSection>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              letterSpacing: '2px',
              color: theme.accent,
              marginBottom: '16px',
            }}>
              GALLERY
            </div>

            <h2 className="section-title" style={{
              fontFamily: "'Instrument Serif', serif",
              fontWeight: '400',
              fontStyle: 'italic',
              marginBottom: '40px',
              color: theme.text,
            }}>
              Moments captured
            </h2>

            <div className="gallery-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
            }}>
              {galleryImages.map((image, index) => (
                <div
                  key={image.id}
                  className="gallery-item"
                  style={{
                    aspectRatio: index === 0 || index === 3 ? '16/10' : '1/1',
                    gridColumn: index === 0 || index === 3 ? 'span 2' : 'span 1',
                    background: theme.cardBg,
                    border: `1px solid ${theme.cardBorder}`,
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Show carousel if images exist, otherwise placeholder */}
                  {image.image_url ? (
                    <GalleryImageCarousel
                      images={[
                        image.image_url,
                        ...(Array.isArray(image.additional_images) ? image.additional_images : [])
                      ].filter(Boolean)}
                      title={image.title || image.caption}
                      category={image.category}
                      theme={theme}
                    />
                  ) : (
                    /* Placeholder content - shown when no image */
                    <div
                      className="placeholder-content"
                      style={{
                        textAlign: 'center',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'absolute',
                        inset: 0,
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        margin: '0 auto 12px',
                        borderRadius: '50%',
                        background: theme.accentBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                      }}>
                        📷
                      </div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        letterSpacing: '1px',
                        color: theme.accent,
                        marginBottom: '4px',
                      }}>
                        {(image.category || 'PHOTO').toUpperCase()}
                      </div>
                      <div style={{
                        fontFamily: "'Source Serif 4', serif",
                        fontSize: '14px',
                        color: theme.textSecondary,
                      }}>
                        {image.title || image.caption}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Writing/Blog Section */}
      <section id="writing" className="section-padding" style={{
        borderTop: `1px solid ${theme.border}`,
      }}>
        <AnimatedSection>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              letterSpacing: '2px',
              color: theme.accent,
              marginBottom: '16px',
            }}>
              BLOG
            </div>

            <h2 className="section-title" style={{
              fontFamily: "'Instrument Serif', serif",
              fontWeight: '400',
              fontStyle: 'italic',
              marginBottom: '40px',
              color: theme.text,
            }}>
              Thoughts & reflections
            </h2>

            <div style={{
              display: 'grid',
              gap: '24px',
            }}>
              {blogPosts.map((post, index) => (
                <article
                  key={index}
                  onClick={() => setSelectedPostId(post.id)}
                  style={{
                    padding: 'clamp(24px, 5vw, 40px)',
                    background: theme.cardBg,
                    border: `1px solid ${theme.cardBorder}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.accent + '50';
                    e.currentTarget.style.background = theme.accentBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.cardBorder;
                    e.currentTarget.style.background = theme.cardBg;
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}>
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '10px',
                      letterSpacing: '1px',
                      color: theme.accent,
                      padding: '4px 8px',
                      background: theme.accentBg,
                    }}>
                      {post.category}
                    </span>
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '10px',
                      color: theme.textMuted,
                    }}>
                      {post.date} · {post.readTime} read
                    </span>
                  </div>

                  <h3 style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 'clamp(20px, 5vw, 28px)',
                    fontWeight: '400',
                    fontStyle: 'italic',
                    marginBottom: '12px',
                    color: theme.text,
                  }}>
                    {post.title}
                  </h3>

                  <p style={{
                    fontSize: '15px',
                    lineHeight: '1.7',
                    color: theme.textSecondary,
                    marginBottom: '16px',
                  }}>
                    {post.excerpt || (post.content ? post.content.replace(/[#*`]/g, '').slice(0, 200) + '...' : '')}
                  </p>

                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.accent,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    Read more <span>→</span>
                  </div>
                </article>
              ))}
            </div>

            <div style={{
              textAlign: 'center',
              marginTop: '40px',
            }}>
              <a
                href="#"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  letterSpacing: '1px',
                  color: theme.textSecondary,
                  textDecoration: 'none',
                  padding: '14px 24px',
                  border: `1px solid ${theme.border}`,
                  display: 'inline-block',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = theme.accent;
                  e.target.style.color = theme.accent;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = theme.border;
                  e.target.style.color = theme.textSecondary;
                }}
              >
                VIEW ALL POSTS →
              </a>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Connect Section */}
      <section id="connect" className="section-padding" style={{
        background: theme.bgSecondary,
        borderTop: `1px solid ${theme.border}`,
      }}>
        <AnimatedSection>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
            padding: '0 4px',
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              letterSpacing: '2px',
              color: theme.accent,
              marginBottom: '24px',
            }}>
              CONTACT
            </div>

            <h2 className="connect-title" style={{
              fontFamily: "'Instrument Serif', serif",
              fontWeight: '400',
              fontStyle: 'italic',
              marginBottom: '32px',
            }}>
              Let's connect
            </h2>

            <p style={{
              fontSize: 'clamp(16px, 4vw, 20px)',
              lineHeight: '1.7',
              color: theme.textSecondary,
              marginBottom: '32px',
            }}>
              Building something absurdly bold? A founder with conviction, an investor exploring Bharat, or an institution designing ecosystems — I'm open to the right conversations.
            </p>

            {/* Contact Form */}
            <div style={{ marginTop: '32px', marginBottom: '32px' }}>
              <ContactForm theme={theme} />
            </div>

            <div style={{
              marginTop: '40px',
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
            }}>
              <a
                href="https://www.linkedin.com/in/karthiknagpuri"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  letterSpacing: '1px',
                }}
              >
                LINKEDIN ↗
              </a>
            </div>
          </div>
        </AnimatedSection>
      </section>
      </>
      )}

      {/* Footer */}
      <footer style={{
        padding: '32px 20px',
        borderTop: `1px solid ${theme.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '20px',
          fontStyle: 'italic',
          color: theme.text,
        }}>
          Zero
        </div>

        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '10px',
          color: theme.textMuted,
        }}>
          <p>Building from Hyderabad 🏠</p>
          <p style={{ marginTop: '4px' }}>Democratizing AI & Innovation across Bharat</p>
        </div>
      </footer>

      {/* Floating Element - Desktop only */}
      <div className="floating-text" style={{
        position: 'fixed',
        bottom: '48px',
        right: '48px',
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        fontFamily: "'Space Mono', monospace",
        fontSize: '10px',
        letterSpacing: '2px',
        color: theme.textMuted,
        transform: 'rotate(180deg)',
        zIndex: 50,
      }}>
        ZERO — AI ENGINEER — ECOSYSTEM BUILDER — CONNECTOR OF HUMANS
      </div>

      {/* Blog Post Modal */}
      {selectedPostId && (
        <BlogPost
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
          showEditButton={false}
        />
      )}

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardHelp
        show={showHelp}
        onClose={() => setShowHelp(false)}
        theme={theme}
      />

      {/* Keyboard hint */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        fontFamily: "'Space Mono', monospace",
        fontSize: '10px',
        color: theme.textMuted,
        opacity: 0.5,
        zIndex: 50,
      }}>
        Press ? for shortcuts
      </div>
    </div>
  );
}
