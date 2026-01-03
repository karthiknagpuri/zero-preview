import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const BlogContext = createContext();

// Fallback sample posts for when Supabase is not available
const fallbackPosts = [
  {
    id: '0',
    title: 'Why Zero?',
    excerpt: 'A personal story of loss, discovery, and finding strength in the void. How a random blog from 2014 became my lifeline during COVID.',
    content: `During COVID, I was with my parents and my sister. We had a tough time, like everyone else. Many people lost their dear ones. Many people lost their opportunities. Many people died during COVID.

The same situation happened with my parents when they were on COVID, and we were in ICU. There were no vaccines in the first COVID. My sister had COVID. I had COVID. No parents or family coming to support us.

During the same time, they were on a deathbed for 14 days straight in ICU. And I came out after dancing and making some jokes, giving hope, saying that our sister is okay and everyone is doing good.

When I came out of ICU, I sat in the hospital waiting hall and I was scrolling through my mobile on vaccine availability, vaccine updates, and everything. I couldn't find any news. And everything randomly, somehow, I found this random blog from 2014 on a random WordPress website. It said "Zero Infinity" or "Zero Void." It felt something interesting.

## The Blog That Changed Everything

That blog explained with reference to Sanskrit, Bhagavad Gita, and also old Vedas, Puranas. Zero means **sunya**—the word derived from Sanskrit. And the same word, paradoxically, **sunya** means universe, which is infinite energy. Which means: you are nothing and you are everything.

I started reading, and at the end of the blog it said: **"It is neither void nor universe. It is a prospect to what we are looking at."**

In the same way, it goes with me. That awakened me and gave me strength of inner potential and sense of support during my tough times.

## Why I Call Myself Zero

Eventually, I wanted to keep that philosophy for myself—which gave my parents back, which gave my life back, which gave me a big hope. And I wanted to keep that philosophy.

The reason behind calling Zero is that it gives me more space to evolve, experiment, feel, progress. When I feel I know nothing, I am nothing, that gives me sense of lightness and to occupy and to open for more learnings, more failures, more progress, more success.

**It is not by lack of value, lack of confidence, or lack of anything. It means perspective. And perspective is a big word.**

## Beyond Social Tags

The paradox of being Zero also says: we are much more beyond potential than what we are with the social tags. Maybe we are student, founder, co-founder, working professional. Everything—these are social tags that limit you.

Being Zero means going beyond all these potential social tags. Your potential is immense.

**Every day is so precious. Every day is a new year. Every day is a new birthday. Every day is a new life.**

And that is me being the paradox of being Zero.`,
    date: '2024-12-27',
    readTime: '6 min',
    category: 'PERSONAL',
    published: true,
    featured: true,
  },
  {
    id: '1',
    title: 'Why Middle India Will Birth the Next Unicorn',
    excerpt: 'The narrative of Indian startups is being rewritten. Not in Bangalore or Mumbai, but in places like Deoria, Raipur, and Ranchi.',
    content: `The narrative of Indian startups is being rewritten. Not in Bangalore or Mumbai, but in places like Deoria, Raipur, and Ranchi.

For years, we've been told that innovation happens in metros. That you need to be in the "right" ecosystem to build something meaningful. But what if that's changing?

## The Untold Story

Having traveled across 20+ cities in Middle India through Jagriti Yatra and EvolveX, I've seen something remarkable. Founders in tier-2 and tier-3 cities aren't just surviving—they're thriving with a different playbook.

### Lower Burn, Higher Grit

These founders understand frugality at a molecular level. A startup in Raipur operates on 1/10th the burn rate of a Bangalore startup, yet serves the same market size. They're not playing the VC game—they're building real, profitable businesses.

### Understanding the Real India

When you're building from Lucknow, you inherently understand what 900 million Indians need. You're not building for a hypothetical "Bharat"—you ARE Bharat.

## The Pattern I See

Every month, I meet founders who would be considered "uninvestable" by traditional metrics. Yet they're building businesses that:

- Serve millions of users
- Are profitable from year one
- Solve problems the metros don't even know exist

The next unicorn won't come from a WeWork in Mumbai. It'll come from a small office in a city you've never heard of, built by someone who refused to play by the old rules.

*This is why I do what I do. This is why EvolveX exists.*`,
    date: '2024-12-15',
    readTime: '4 min',
    category: 'ECOSYSTEM',
    published: true,
    featured: true,
  },
  {
    id: '2',
    title: 'Building in Public: The EvolveX Journey',
    excerpt: 'From zero to 100+ startups. Lessons learned from building a founder-first community across Bharat.',
    content: `From zero to 100+ startups. Lessons learned from building a founder-first community across Bharat.

When I started EvolveX in 2019, I had no playbook. No funding. No connections. Just a belief that founders outside metros deserved better support.

## Year One: The Hustle

The first year was brutal. I cold-emailed 500+ founders, got 20 responses, and 5 showed up to our first event. Those 5 became our core community.

### What Worked:
- **Authenticity over polish** — Our events were raw but real
- **Value before ask** — We gave before we asked anything in return
- **Consistency** — We showed up every single week

### What Failed:
- Trying to copy Bangalore ecosystem models
- Charging too early
- Over-promising and under-delivering

## The Turning Point

Month 18. We had 50 founders in our community. Then Draper Startup House reached out. Then Headstart. Then government bodies.

The lesson? Build something valuable, and the ecosystem comes to you.

## Where We Are Now

- 100+ startups supported
- 10.5K+ community members
- Partnerships with major ecosystem players
- A 5-year vision to empower 10,000 founders

## What I've Learned

1. **Community > Network** — Networks are transactional. Communities are transformational.
2. **Patience compounds** — Year 1 and Year 5 look nothing alike.
3. **Your background is your superpower** — Being from rural Telangana isn't a disadvantage. It's why I understand the founders I serve.

The journey continues. And I'm documenting every step.`,
    date: '2024-11-20',
    readTime: '5 min',
    category: 'STARTUP',
    published: true,
    featured: false,
  },
  {
    id: '3',
    title: 'The Train That Changed Everything',
    excerpt: "8,000 kilometers. 15 days. 500+ founders. What Jagriti Yatra taught me about India's entrepreneurial spirit.",
    content: `8,000 kilometers. 15 days. 500+ founders. What Jagriti Yatra taught me about India's entrepreneurial spirit.

Picture this: A train carrying 500 aspiring entrepreneurs, stopping at 12 destinations across India, meeting role models who've built enterprises from nothing.

That's Jagriti Yatra. And it changed everything for me.

## Day 1: The Beginning

I boarded at Hyderabad with a backpack and a notebook. I had no idea that 15 days later, I'd have a completely different worldview.

## The Places That Shaped Me

### Deoria, UP
Population: 100,000. Entrepreneurs I met: 15+.
A town I'd never heard of, producing founders solving real problems for rural India.

### Ranchi
The energy of young founders building fintech for the unbanked. No VC funding. Just grit and customer obsession.

### Madurai
Manufacturing entrepreneurs competing globally. From a "tier-3 city."

## The Conversations at 3 AM

The best part of Yatra isn't the official sessions. It's the conversations that happen in train compartments at 3 AM.

Founders sharing failures. Mentors being vulnerable. Strangers becoming lifelong collaborators.

## What I Brought Back

1. **Humility** — My problems are small compared to what some founders overcome
2. **Network** — 500 connections who actually get it
3. **Purpose** — A clear mission to serve Middle India founders
4. **Hope** — India's best days are ahead

## Now I'm on the Other Side

Today, I manage Selections & Alumni for Jagriti Yatra. I help choose who gets this transformative experience. It's a responsibility I don't take lightly.

Every application I read, I think: "Could this be the next founder who changes everything?"

*The train keeps moving. And so do we.*`,
    date: '2023-12-10',
    readTime: '5 min',
    category: 'JOURNEY',
    published: true,
    featured: false,
  },
  {
    id: '4',
    title: 'Flow State: The Science of Being Zero',
    excerpt: 'When you enter flow, your mind quiets the inner narrator. Neuroscience meets ancient philosophy.',
    content: `When you enter flow, your mind quiets the inner narrator. In neuroscience, this correlates with reduced activity in self-referential networks and tighter coupling between attention and action.

Subjectively, it feels like becoming zero: less ego-noise, fewer distractions, a clean channel for execution.

## The Default Mode Network

Your brain has a "default mode network" (DMN) that activates when you're not focused on the outside world. It's responsible for:

- Self-reflection
- Mind-wandering
- Worrying about the future
- Ruminating on the past

When you enter flow, the DMN quiets down. You stop thinking about yourself and become one with the task.

## The Zero-State Connection

This is exactly what ancient philosophies describe as "sunya" or emptiness. Not a void of nothingness, but a state of pure potential.

### In Flow:
- Time disappears
- Self-consciousness fades
- Action and awareness merge
- The inner critic goes silent

### In Zero-State:
- Labels dissolve
- Ego boundaries soften
- Pure presence emerges
- Infinite possibility opens

## How to Access It

1. **Clear goals** — Know exactly what you're trying to achieve
2. **Immediate feedback** — See the results of your actions instantly
3. **Challenge-skill balance** — The task should stretch you, but not break you
4. **Deep focus** — Eliminate all distractions

## The Paradox

The harder you try to achieve flow, the more it eludes you. You have to let go of trying. You have to become zero.

*Less self-talk. More signal.*`,
    date: '2024-12-20',
    readTime: '4 min',
    category: 'PHILOSOPHY',
    published: true,
    featured: true,
  },
];

// Visibility options: 'public', 'private', 'password'
const VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  PASSWORD: 'password',
};

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Transform Supabase row to app format
const transformPost = (row) => ({
  id: row.id,
  title: row.title,
  slug: row.slug || generateSlug(row.title),
  excerpt: row.excerpt,
  content: row.content,
  category: row.category,
  published: row.published,
  featured: row.featured,
  visibility: row.visibility || 'public',
  password: row.password || '',
  readTime: row.read_time,
  date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
});

export function BlogProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useSupabase, setUseSupabase] = useState(true);
  const [error, setError] = useState(null);

  // Load posts from Supabase or localStorage
  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Try Supabase first
        const { data, error: supabaseError } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) {
          console.warn('Supabase error, falling back to localStorage:', supabaseError.message);
          setUseSupabase(false);
          loadFromLocalStorage();
          return;
        }

        if (data && data.length > 0) {
          setPosts(data.map(transformPost));
          setUseSupabase(true);
        } else {
          // No data in Supabase, use fallback
          console.log('No posts in Supabase, using fallback data');
          setPosts(fallbackPosts);
          setUseSupabase(false);
        }
        setIsLoaded(true);
      } catch (err) {
        console.warn('Failed to connect to Supabase, using localStorage:', err);
        setUseSupabase(false);
        loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = () => {
      const savedPosts = localStorage.getItem('zeroBlogPosts');
      if (savedPosts) {
        setPosts(JSON.parse(savedPosts));
      } else {
        setPosts(fallbackPosts);
        localStorage.setItem('zeroBlogPosts', JSON.stringify(fallbackPosts));
      }
      setIsLoaded(true);
    };

    loadPosts();
  }, []);

  // Sync to localStorage when using localStorage mode
  useEffect(() => {
    if (isLoaded && !useSupabase) {
      localStorage.setItem('zeroBlogPosts', JSON.stringify(posts));
    }
  }, [posts, isLoaded, useSupabase]);

  // CRUD Operations
  const createPost = async (postData) => {
    const readTime = `${Math.ceil(postData.content.split(' ').length / 200)} min`;

    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([{
            title: postData.title,
            slug: postData.slug || generateSlug(postData.title),
            excerpt: postData.excerpt,
            content: postData.content,
            category: postData.category,
            published: postData.published || false,
            featured: postData.featured || false,
            visibility: postData.visibility || 'public',
            password: postData.visibility === 'password' ? postData.password : null,
            read_time: readTime,
          }])
          .select()
          .single();

        if (error) throw error;

        const newPost = transformPost(data);
        setPosts(prev => [newPost, ...prev]);
        return newPost;
      } catch (err) {
        console.error('Failed to create post in Supabase:', err);
        setError(err.message);
        return null;
      }
    } else {
      // localStorage fallback
      const newPost = {
        ...postData,
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        readTime,
      };
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    }
  };

  const updatePost = async (id, postData) => {
    const readTime = `${Math.ceil(postData.content.split(' ').length / 200)} min`;

    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .update({
            title: postData.title,
            slug: postData.slug || generateSlug(postData.title),
            excerpt: postData.excerpt,
            content: postData.content,
            category: postData.category,
            published: postData.published,
            featured: postData.featured,
            visibility: postData.visibility || 'public',
            password: postData.visibility === 'password' ? postData.password : null,
            read_time: readTime,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        setPosts(prev => prev.map(post =>
          post.id === id ? transformPost(data) : post
        ));
      } catch (err) {
        console.error('Failed to update post in Supabase:', err);
        setError(err.message);
      }
    } else {
      // localStorage fallback
      setPosts(prev => prev.map(post =>
        post.id === id
          ? { ...post, ...postData, readTime }
          : post
      ));
    }
  };

  const deletePost = async (id) => {
    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setPosts(prev => prev.filter(post => post.id !== id));
      } catch (err) {
        console.error('Failed to delete post from Supabase:', err);
        setError(err.message);
      }
    } else {
      // localStorage fallback
      setPosts(prev => prev.filter(post => post.id !== id));
    }
  };

  const getPost = (id) => {
    return posts.find(post => post.id === id);
  };

  const getPublishedPosts = () => {
    return posts.filter(post => post.published && post.visibility !== 'private');
  };

  const getFeaturedPosts = () => {
    return posts.filter(post => post.published && post.featured && post.visibility !== 'private');
  };

  const verifyPostPassword = (postId, password) => {
    const post = posts.find(p => p.id === postId);
    if (!post || post.visibility !== 'password') return true;
    return post.password === password;
  };

  const togglePublish = async (id) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .update({ published: !post.published, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;

        setPosts(prev => prev.map(p =>
          p.id === id ? { ...p, published: !p.published } : p
        ));
      } catch (err) {
        console.error('Failed to toggle publish in Supabase:', err);
        setError(err.message);
      }
    } else {
      // localStorage fallback
      setPosts(prev => prev.map(p =>
        p.id === id ? { ...p, published: !p.published } : p
      ));
    }
  };

  const toggleFeatured = async (id) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .update({ featured: !post.featured, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;

        setPosts(prev => prev.map(p =>
          p.id === id ? { ...p, featured: !p.featured } : p
        ));
      } catch (err) {
        console.error('Failed to toggle featured in Supabase:', err);
        setError(err.message);
      }
    } else {
      // localStorage fallback
      setPosts(prev => prev.map(p =>
        p.id === id ? { ...p, featured: !p.featured } : p
      ));
    }
  };

  // Refresh posts from Supabase
  const refreshPosts = async () => {
    if (!useSupabase) return;

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data.map(transformPost));
    } catch (err) {
      console.error('Failed to refresh posts:', err);
      setError(err.message);
    }
  };

  return (
    <BlogContext.Provider value={{
      posts,
      isLoaded,
      useSupabase,
      error,
      createPost,
      updatePost,
      deletePost,
      getPost,
      getPublishedPosts,
      getFeaturedPosts,
      verifyPostPassword,
      togglePublish,
      toggleFeatured,
      refreshPosts,
    }}>
      {children}
    </BlogContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBlog() {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
}

export default BlogContext;
