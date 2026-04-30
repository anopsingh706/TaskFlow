const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('<')) {
    console.warn('⚠️  Email not configured — meeting summary emails will be skipped');
    return null;
  }

  transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST  || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
};

/**
 * Send meeting AI summary to all participants
 */
const sendMeetingSummary = async ({ to, meetingTitle, keyPoints, actionItems, duration }) => {
  const t = getTransporter();
  if (!t) return { skipped: true };

  const pointsList  = keyPoints.map(p  => `<li>${p}</li>`).join('');
  const actionsList = actionItems.map(a => `<li>${a}</li>`).join('');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(91,79,233,0.1)">
      <div style="background:linear-gradient(135deg,#5B4FE9,#7C6FFF);padding:32px 28px">
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">⚡ TaskFlow</h1>
        <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px">AI Meeting Summary</p>
      </div>
      <div style="padding:28px">
        <h2 style="margin:0 0 4px;font-size:18px;color:#111118">${meetingTitle}</h2>
        <p style="margin:0 0 24px;font-size:13px;color:#6B7280">Duration: ${duration || 'N/A'} · Summarised by Gemini AI</p>

        <h3 style="font-size:14px;font-weight:700;color:#5B4FE9;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px">📝 Key Points</h3>
        <ul style="margin:0 0 24px;padding-left:20px;color:#374151;font-size:14px;line-height:1.8">${pointsList || '<li>No key points captured</li>'}</ul>

        <h3 style="font-size:14px;font-weight:700;color:#F97316;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px">✅ Action Items</h3>
        <ul style="margin:0 0 24px;padding-left:20px;color:#374151;font-size:14px;line-height:1.8">${actionsList || '<li>No action items identified</li>'}</ul>

        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/meetings"
           style="display:inline-block;background:#5B4FE9;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600">
          View in TaskFlow →
        </a>
      </div>
      <div style="padding:16px 28px;background:#F8F7FF;border-top:1px solid #E8E7F0">
        <p style="margin:0;font-size:12px;color:#9CA3AF">Sent by TaskFlow AI · <a href="${process.env.CLIENT_URL}" style="color:#5B4FE9">Open app</a></p>
      </div>
    </div>`;

  await t.sendMail({
    from:    process.env.EMAIL_FROM || `TaskFlow <${process.env.EMAIL_USER}>`,
    to:      Array.isArray(to) ? to.join(', ') : to,
    subject: `📋 Meeting Summary: ${meetingTitle}`,
    html,
  });

  return { sent: true };
};

/**
 * Send task assignment notification email
 */
const sendTaskAssignedEmail = async ({ to, taskTitle, assignedBy, dueDate, link }) => {
  const t = getTransporter();
  if (!t) return { skipped: true };

  await t.sendMail({
    from:    process.env.EMAIL_FROM || `TaskFlow <${process.env.EMAIL_USER}>`,
    to,
    subject: `📌 New Task: ${taskTitle}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:500px;margin:0 auto">
        <div style="background:#5B4FE9;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px">⚡ TaskFlow</h1>
        </div>
        <div style="padding:24px;background:#fff;border:1px solid #E8E7F0;border-radius:0 0 12px 12px">
          <p style="color:#374151;font-size:15px"><strong>${assignedBy}</strong> assigned you a new task:</p>
          <h2 style="color:#111118;font-size:18px;margin:8px 0">${taskTitle}</h2>
          ${dueDate ? `<p style="color:#F97316;font-size:13px">📅 Due: ${new Date(dueDate).toLocaleDateString()}</p>` : ''}
          <a href="${link || process.env.CLIENT_URL + '/tasks'}" style="display:inline-block;background:#5B4FE9;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;margin-top:16px">View Task →</a>
        </div>
      </div>`,
  });

  return { sent: true };
};

module.exports = { sendMeetingSummary, sendTaskAssignedEmail };