import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const ReadingLogSection = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isEditing, setIsEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    date_read: '',
    rating: 5,
    status: 'completed',
    notes: '',
    cover_url: '',
    is_visible: true,
  });

  const theme = {
    bg: '#0a0a0a',
    surface: '#141414',
    border: 'rgba(255,255,255,0.1)',
    text: '#ffffff',
    textMuted: '#888888',
    accent: '#C4785A',
    teal: '#4ECDC4',
    yellow: '#FFE66D',
    danger: '#FF6B6B',
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reading_log')
        .select('*')
        .order('date_read', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.log('Reading log table may not exist yet:', error);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        author: formData.author,
        date_read: formData.date_read || null,
        rating: formData.rating,
        status: formData.status,
        notes: formData.notes,
        cover_url: formData.cover_url,
        is_visible: formData.is_visible,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('reading_log')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', isEditing);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reading_log')
          .insert([{ ...payload, display_order: books.length }]);
        if (error) throw error;
      }

      fetchBooks();
      resetForm();
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Error saving book. Make sure the reading_log table exists in Supabase.');
    }
  };

  const deleteBook = async (id) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      const { error } = await supabase.from('reading_log').delete().eq('id', id);
      if (error) throw error;
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const editBook = (book) => {
    setIsEditing(book.id);
    setFormData({
      title: book.title,
      author: book.author,
      date_read: book.date_read || '',
      rating: book.rating || 5,
      status: book.status || 'completed',
      notes: book.notes || '',
      cover_url: book.cover_url || '',
      is_visible: book.is_visible,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setIsEditing(null);
    setShowForm(false);
    setFormData({
      title: '',
      author: '',
      date_read: '',
      rating: 5,
      status: 'completed',
      notes: '',
      cover_url: '',
      is_visible: true,
    });
  };

  const toggleVisibility = async (book) => {
    try {
      const { error } = await supabase
        .from('reading_log')
        .update({ is_visible: !book.is_visible })
        .eq('id', book.id);
      if (error) throw error;
      fetchBooks();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={interactive ? () => onChange(star) : undefined}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              fontSize: '18px',
              color: star <= rating ? theme.yellow : theme.textMuted,
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const filteredBooks = activeTab === 'all' 
    ? books 
    : books.filter(b => b.status === activeTab);


  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '24px',
            fontStyle: 'italic',
            color: theme.text,
            margin: '0 0 4px 0',
          }}>
            Reading Log
          </h1>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: theme.textMuted,
            margin: 0,
          }}>
            Track books you're reading and have read
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: theme.accent,
            color: theme.bg,
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            cursor: 'pointer',
            letterSpacing: '1px',
          }}
        >
          + ADD BOOK
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'reading', label: 'Currently Reading' },
          { key: 'completed', label: 'Completed' },
          { key: 'want_to_read', label: 'Want to Read' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: activeTab === tab.key ? theme.accent : 'transparent',
              border: `1px solid ${activeTab === tab.key ? theme.accent : theme.border}`,
              borderRadius: '6px',
              padding: '10px 20px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: activeTab === tab.key ? theme.bg : theme.textMuted,
              cursor: 'pointer',
              letterSpacing: '1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>


      {/* Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <div style={{
              padding: '24px',
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: '20px',
                fontStyle: 'italic',
                color: theme.text,
                margin: 0,
              }}>
                {isEditing ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button
                onClick={resetForm}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.textMuted,
                  fontSize: '24px',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                  marginBottom: '8px',
                  letterSpacing: '1px',
                }}>
                  BOOK TITLE *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    padding: '12px',
                    color: theme.text,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                  placeholder="e.g., Zero to One"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                  marginBottom: '8px',
                  letterSpacing: '1px',
                }}>
                  AUTHOR *
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    padding: '12px',
                    color: theme.text,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                  placeholder="e.g., Peter Thiel"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                    marginBottom: '8px',
                    letterSpacing: '1px',
                  }}>
                    STATUS
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      background: theme.bg,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '6px',
                      padding: '12px',
                      color: theme.text,
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="reading">Currently Reading</option>
                    <option value="completed">Completed</option>
                    <option value="want_to_read">Want to Read</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: theme.textMuted,
                    marginBottom: '8px',
                    letterSpacing: '1px',
                  }}>
                    DATE READ
                  </label>
                  <input
                    type="date"
                    value={formData.date_read}
                    onChange={(e) => setFormData({ ...formData, date_read: e.target.value })}
                    style={{
                      width: '100%',
                      background: theme.bg,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '6px',
                      padding: '12px',
                      color: theme.text,
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                  marginBottom: '8px',
                  letterSpacing: '1px',
                }}>
                  RATING
                </label>
                {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                  marginBottom: '8px',
                  letterSpacing: '1px',
                }}>
                  COVER IMAGE URL
                </label>
                <input
                  type="url"
                  value={formData.cover_url}
                  onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                  style={{
                    width: '100%',
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    padding: '12px',
                    color: theme.text,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                  placeholder="https://..."
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                  marginBottom: '8px',
                  letterSpacing: '1px',
                }}>
                  NOTES
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    padding: '12px',
                    color: theme.text,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Your thoughts on the book..."
                />
              </div>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '12px',
                color: theme.textMuted,
                marginBottom: '24px',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={formData.is_visible}
                  onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                />
                Visible on public site
              </label>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: theme.accent,
                    color: theme.bg,
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    cursor: 'pointer',
                    letterSpacing: '1px',
                  }}
                >
                  {isEditing ? 'UPDATE' : 'ADD'} BOOK
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    background: 'none',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    padding: '12px 24px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    color: theme.textMuted,
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Books List */}
      <div style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {isLoading ? (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            color: theme.textMuted,
          }}>
            Loading books...
          </div>
        ) : filteredBooks.length === 0 ? (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            color: theme.textMuted,
          }}>
            No books yet. Click "Add Book" to start your reading log.
          </div>
        ) : (
          <div>
            {filteredBooks.map((book, index) => (
              <div
                key={book.id}
                style={{
                  padding: '20px',
                  borderBottom: index < filteredBooks.length - 1 ? `1px solid ${theme.border}` : 'none',
                  display: 'flex',
                  gap: '16px',
                  opacity: book.is_visible ? 1 : 0.5,
                }}
              >
                {/* Book Cover */}
                <div style={{
                  width: '60px',
                  height: '90px',
                  background: theme.bg,
                  borderRadius: '4px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {book.cover_url ? (
                    <img 
                      src={book.cover_url} 
                      alt={book.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '24px' }}>📚</span>
                  )}
                </div>

                {/* Book Info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '4px',
                  }}>
                    <h3 style={{
                      fontFamily: "'Instrument Serif', serif",
                      fontSize: '18px',
                      fontStyle: 'italic',
                      color: theme.text,
                      margin: 0,
                    }}>
                      {book.title}
                    </h3>
                    {book.status === 'reading' && (
                      <span style={{
                        background: theme.teal,
                        color: theme.bg,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        letterSpacing: '0.5px',
                      }}>
                        READING
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    color: theme.textMuted,
                    marginBottom: '8px',
                  }}>
                    by {book.author}
                    {book.date_read && ` • ${new Date(book.date_read).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                  </div>
                  {renderStars(book.rating)}
                  {book.notes && (
                    <p style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '12px',
                      color: theme.textMuted,
                      margin: '8px 0 0 0',
                      lineHeight: '1.5',
                    }}>
                      {book.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => toggleVisibility(book)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme.textMuted,
                      cursor: 'pointer',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      padding: '4px',
                    }}
                  >
                    {book.is_visible ? 'HIDE' : 'SHOW'}
                  </button>
                  <button
                    onClick={() => editBook(book)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme.accent,
                      cursor: 'pointer',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      padding: '4px',
                    }}
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => deleteBook(book.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme.danger,
                      cursor: 'pointer',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      padding: '4px',
                    }}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingLogSection;
