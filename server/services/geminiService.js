const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getClient = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('<')) {
      throw new Error('GEMINI_API_KEY is not configured in .env');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const getModel = () => getClient().getGenerativeModel({ model: 'gemini-1.5-flash' });

const parseJSON = (text) => {
  const clean = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(clean);
};

// ── Task priority suggestion ────────────────────────────────
const suggestTaskPriority = async (title, description = '') => {
  const model = getModel();
  const result = await model.generateContent(`
You are a project management AI. Analyse this task and suggest a priority level.
Task Title: "${title}"
Task Description: "${description || 'No description'}"

Respond ONLY with valid JSON:
{"priority":"high"|"medium"|"low","reason":"One sentence max 100 chars","confidence":0.0-1.0}

high = critical/blocking/security/deadline<3days
medium = important feature/deadline 3-14 days
low = nice-to-have/refactor/docs/no deadline`);

  const data = parseJSON(result.response.text());
  if (!['high','medium','low'].includes(data.priority)) data.priority = 'medium';
  if (typeof data.confidence !== 'number') data.confidence = 0.7;
  return { priority: data.priority, reason: data.reason || '', confidence: Math.min(1, Math.max(0, data.confidence)) };
};

// ── Meeting summary ─────────────────────────────────────────
const summarizeMeeting = async (title, participants, transcript = [], duration = '') => {
  const model = getModel();

  const transcriptText = transcript.length > 0
    ? transcript.map(t => `${t.speaker}: ${t.text}`).join('\n')
    : `Meeting: ${title}\nParticipants: ${participants.join(', ')}\nDuration: ${duration}`;

  const result = await model.generateContent(`
You are an AI meeting assistant. Analyse this meeting and extract a structured summary.

${transcriptText}

Respond ONLY with valid JSON:
{
  "keyPoints": ["point 1","point 2","point 3"],
  "actionItems": ["action 1","action 2"],
  "summary": "2-3 sentence overview"
}

- keyPoints: 3-6 most important decisions/discussions
- actionItems: concrete next steps with owner if mentioned
- All items should be concise (max 100 chars each)`);

  return parseJSON(result.response.text());
};

// ── Chat thread summary ─────────────────────────────────────
const summarizeChat = async (messages) => {
  const model = getModel();
  const transcript = messages.map(m => `${m.sender}: ${m.content}`).join('\n');

  const result = await model.generateContent(`
Summarise this team chat conversation into 3-5 concise bullet points.
Focus on decisions, action items, and key information shared.

Conversation:
${transcript}

Respond ONLY with a JSON array of strings:
["bullet 1","bullet 2","bullet 3"]`);

  return parseJSON(result.response.text());
};

// ── Smart reply suggestion ──────────────────────────────────
const suggestSmartReply = async (messages) => {
  const model = getModel();
  const last3 = messages.slice(-3).map(m => `${m.sender}: ${m.content}`).join('\n');

  const result = await model.generateContent(`
You are a helpful AI assistant in a team chat. Suggest 3 short, contextual reply options for the last message.

Recent messages:
${last3}

Respond ONLY with a JSON array of 3 short strings (max 60 chars each):
["reply 1","reply 2","reply 3"]`);

  return parseJSON(result.response.text());
};

module.exports = { suggestTaskPriority, summarizeMeeting, summarizeChat, suggestSmartReply };