// UPDATE EXPERIENCES IN SUPABASE
// Run this in browser console while on the site
// This will update EvolveX and Jagriti Yatra entries

(async () => {
  const SUPABASE_URL = 'https://jzbkpdxykuqbildukftz.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_xpQttjn7pfWme1SY8OzWOQ_YCE0HpJN';

  // Get auth token from localStorage
  const authData = localStorage.getItem('sb-jzbkpdxykuqbildukftz-auth-token');
  let accessToken = SUPABASE_ANON_KEY;

  if (authData) {
    const parsed = JSON.parse(authData);
    accessToken = parsed.access_token || SUPABASE_ANON_KEY;
    console.log('Using authenticated session');
  }

  // Update EvolveX
  const evolveXUpdate = await fetch(`${SUPABASE_URL}/rest/v1/experiences?title=eq.EvolveX`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      description: 'Founder-first ecosystem infrastructure and discovery layer. Evaluated, supported, and accelerated 100+ early-stage startups across Tier-2/3 India through structured founder programs, Curated Invite-Only events, and long-term operator support.'
    })
  });
  console.log('EvolveX update:', evolveXUpdate.ok ? '✓' : '✗', evolveXUpdate.status);

  // Update Jagriti Yatra
  const jagritiUpdate = await fetch(`${SUPABASE_URL}/rest/v1/experiences?title=eq.Jagriti%20Yatra`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      role: 'Manager — Selections & Alumni Relations',
      description: "Co-Creating and leading selection systems, community of one of India's largest entrepreneurship platforms, evaluating thousands of applicants annually and onboarding 525 changemakers across Bharat."
    })
  });
  console.log('Jagriti Yatra update:', jagritiUpdate.ok ? '✓' : '✗', jagritiUpdate.status);

  console.log('Done! Refresh the page to see updates.');
})();
