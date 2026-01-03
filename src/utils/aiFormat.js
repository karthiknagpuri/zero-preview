// AI Auto-Format utility - Supports Anthropic Claude and OpenAI GPT

const FORMAT_PROMPT = `Format this raw text into clean, readable HTML for a blog post. Apply these rules:

1. Use <h2> for main section headings
2. Use <h3> for sub-sections
3. Use <strong> for important terms and labels (e.g., <strong>Location:</strong>)
4. Use <em> for emphasis and quotes
5. Wrap paragraphs in <p> tags
6. Format lists properly:
   - Use <ul><li>...</li></ul> for bullet lists
   - Use <ol><li>...</li></ol> for numbered lists
7. Use <blockquote><p>...</p></blockquote> for quotes
8. Use <hr> for section dividers where appropriate
9. Keep content concise and scannable
10. Preserve all original information
11. For links use <a href="url">text</a>
12. Do NOT include <html>, <head>, <body> tags - just the content HTML

Return ONLY the formatted HTML, no explanations or code blocks.

Raw text to format:
`;

// Format using Anthropic Claude API
export async function formatWithClaude(content, apiKey) {
  if (!apiKey) throw new Error('Anthropic API key not configured');

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
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: FORMAT_PROMPT + content
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// Format using OpenAI GPT API
export async function formatWithOpenAI(content, apiKey) {
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an HTML formatting assistant. Format text into clean, readable blog content using semantic HTML tags.'
        },
        {
          role: 'user',
          content: FORMAT_PROMPT + content
        }
      ],
      max_tokens: 4096,
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Main format function - tries preferred provider first
export async function aiAutoFormat(content, settings) {
  const { anthropicKey, openaiKey, preferredProvider = 'anthropic' } = settings;

  // Try preferred provider first
  if (preferredProvider === 'anthropic' && anthropicKey) {
    try {
      return await formatWithClaude(content, anthropicKey);
    } catch (error) {
      console.warn('Claude failed, trying OpenAI:', error.message);
      if (openaiKey) {
        return await formatWithOpenAI(content, openaiKey);
      }
      throw error;
    }
  }

  if (preferredProvider === 'openai' && openaiKey) {
    try {
      return await formatWithOpenAI(content, openaiKey);
    } catch (error) {
      console.warn('OpenAI failed, trying Claude:', error.message);
      if (anthropicKey) {
        return await formatWithClaude(content, anthropicKey);
      }
      throw error;
    }
  }

  // Fallback to whichever key is available
  if (anthropicKey) {
    return await formatWithClaude(content, anthropicKey);
  }
  if (openaiKey) {
    return await formatWithOpenAI(content, openaiKey);
  }

  throw new Error('No API keys configured. Add keys in Settings.');
}

export default aiAutoFormat;
