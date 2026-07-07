const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = `Agnichakra Club <${process.env.FROM_EMAIL || 'noreply@agnichakra.live'}>`;

const base = (content) => `
  <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #c8410a">
      <span style="font-size:24px">🔥</span>
      <span style="font-size:18px;font-weight:800;color:#1a1916">Agnichakra Club</span>
    </div>
    ${content}
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#999">
      Agnichakra Club · Kolkata · This is an automated email, do not reply.
    </div>
  </div>`;

exports.sendOTP = async (email, code) => {
  await resend.emails.send({
    from: FROM, to: email,
    subject: `Your OTP: ${code} — Agnichakra Club`,
    html: base(`
      <p style="color:#444;margin-bottom:16px">Your one-time password for login is:</p>
      <div style="font-size:42px;font-weight:800;letter-spacing:12px;color:#c8410a;margin:24px 0;text-align:center">${code}</div>
      <p style="color:#666;font-size:13px">Valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>
    `)
  });
};

exports.sendWelcome = async (email, fname, plan) => {
  await resend.emails.send({
    from: FROM, to: email,
    subject: `Welcome to Agnichakra Club, ${fname}!`,
    html: base(`
      <p style="font-size:18px;font-weight:700;margin-bottom:8px">Welcome, ${fname}! 🎉</p>
      <p style="color:#444;margin-bottom:16px">Your <strong>${plan}</strong> membership registration is complete.</p>
      <p style="color:#444">Please complete your payment to activate your membership. Once activated, you'll have full access to the member portal.</p>
    `)
  });
};

exports.sendPaymentConfirmed = async (email, fname, month, amount) => {
  await resend.emails.send({
    from: FROM, to: email,
    subject: `Payment Confirmed — ${month} | Agnichakra Club`,
    html: base(`
      <p style="font-size:16px;font-weight:700;color:#1a6b3c;margin-bottom:16px">✅ Payment Confirmed</p>
      <p style="color:#444">Dear <strong>${fname}</strong>,</p>
      <p style="color:#444;margin-top:8px">Your membership payment of <strong>₹${amount}</strong> for <strong>${month}</strong> has been confirmed by the panel.</p>
      <p style="color:#444;margin-top:8px">Your membership is active. See you at the club!</p>
    `)
  });
};

exports.sendPaymentReminder = async (email, fname, month, amount, upiLink) => {
  await resend.emails.send({
    from: FROM, to: email,
    subject: `Due: ₹${amount} for ${month} — Agnichakra Club`,
    html: base(`
      <p style="color:#444">Dear <strong>${fname}</strong>,</p>
      <p style="color:#444;margin-top:8px">Your membership fee of <strong>₹${amount}</strong> for <strong>${month}</strong> is pending.</p>
      <p style="color:#444;margin-top:8px">Pay via UPI using the link below, then submit your UTR number on the portal:</p>
      <div style="background:#f5f4f0;padding:12px 16px;border-radius:8px;margin:16px 0;font-family:monospace;font-size:12px;word-break:break-all;color:#333">${upiLink}</div>
      <p style="color:#888;font-size:12px">Please pay before the 30th to avoid suspension.</p>
    `)
  });
};

exports.sendMessageReply = async (email, fname, subject, replyBody) => {
  await resend.emails.send({
    from: FROM, to: email,
    subject: `Panel replied: ${subject} — Agnichakra Club`,
    html: base(`
      <p style="color:#444">Dear <strong>${fname}</strong>,</p>
      <p style="color:#444;margin-top:8px">The core panel has replied to your message <strong>"${subject}"</strong>:</p>
      <div style="background:#f5f4f0;border-left:4px solid #c8410a;padding:14px 16px;border-radius:4px;margin:16px 0;color:#333;font-size:14px;line-height:1.6">${replyBody}</div>
      <p style="color:#888;font-size:12px">Login to the portal to continue the conversation.</p>
    `)
  });
};
