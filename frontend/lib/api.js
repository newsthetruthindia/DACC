const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('ac_token') : null;

async function request(method, path, body, multipart = false) {
  const token = getToken();
  const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  if (!multipart) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: multipart ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  register:       (b)    => request('POST', '/auth/register', b),
  login:          (b)    => request('POST', '/auth/login', b),
  sendOtp:        (email)=> request('POST', '/auth/otp/send', { email }),
  verifyOtp:      (b)    => request('POST', '/auth/otp/verify', b),
  me:             ()     => request('GET',  '/auth/me'),
  changePassword: (b)    => request('POST', '/auth/change-password', b),

  // Members
  myProfile:      ()     => request('GET',  '/members/me'),
  updateProfile:  (b)    => request('PATCH','/members/me', b),
  allMembers:     (q='') => request('GET',  `/members${q}`),
  approveMember:  (id)   => request('PATCH',`/members/${id}/approve`),
  changePlan:     (id,p) => request('PATCH',`/members/${id}/plan`, { plan:p }),
  suspendMember:  (id,s) => request('PATCH',`/members/${id}/suspend`, { status:s }),

  // Payments
  myPayments:     ()     => request('GET',  '/payments/my'),
  upiLink:        (m)    => request('GET',  `/payments/upi-link?month=${m}`),
  submitPayment:  (fd)   => request('POST', '/payments/submit', fd, true),
  confirmPayment: (id)   => request('POST', '/payments/confirm', { paymentId:id }),
  pendingPayments:()     => request('GET',  '/payments/pending'),
  duesSummary:    (m)    => request('GET',  `/payments/dues-summary?month=${m}`),
  sendReminders:  (m)    => request('POST', '/payments/send-reminders', { month:m }),

  // Notifications
  notifications:  (q='') => request('GET',  `/notifications${q}`),
  unreadCount:    ()     => request('GET',  '/notifications/unread-count'),
  sendNotif:      (b)    => request('POST', '/notifications', b),
  markRead:       (id)   => request('POST', `/notifications/${id}/read`),
  markAllRead:    ()     => request('POST', '/notifications/read-all'),

  // Messages
  sendMessage:    (b)    => request('POST', '/messages', b),
  myMessages:     ()     => request('GET',  '/messages/my'),
  allMessages:    (q='') => request('GET',  `/messages${q}`),
  getMessage:     (id)   => request('GET',  `/messages/${id}`),
  replyMessage:   (id,b) => request('POST', `/messages/${id}/reply`, { body:b }),
  closeMessage:   (id)   => request('PATCH',`/messages/${id}/status`, { status:'CLOSED' }),

  // Panel
  panel:          ()     => request('GET',  '/panel'),
  addPanel:       (b)    => request('POST', '/panel/members', b),
  removePanel:    (uid)  => request('DELETE',`/panel/members/${uid}`),
  resetPanel:     ()     => request('POST', '/panel/reset'),

  // Terms
  terms:          ()     => request('GET',  '/terms'),
  createTerm:     (b)    => request('POST', '/terms', b),
  activateTerm:   (id)   => request('POST', `/terms/${id}/activate`),

  // Admin Members & Settings
  createMember:   (b)    => request('POST', '/members', b),
  updateMember:   (id,b) => request('PATCH',`/members/${id}`, b),
  deleteMember:   (id)   => request('DELETE',`/members/${id}`),
  getSettings:    ()     => request('GET',  '/settings'),
  updateSettings: (b)    => request('PATCH','/settings', b),

  // Transparent Ledger / Funds
  getFunds:       ()     => request('GET',  '/funds'),
  createFundTx:   (b)    => request('POST', '/funds', b),
  deleteFundTx:   (id)   => request('DELETE',`/funds/${id}`),
};

export const PLANS = {
  SILVER:   { label:'Silver',   price:300,  color:'#888888',  bg:'#f0f0f0' },
  GOLD:     { label:'Gold',     price:500,  color:'#b8860b',  bg:'#fef3cd' },
  PLATINUM: { label:'Platinum', price:1000, color:'#5b3db8',  bg:'#ede8ff' },
};

export const fmtMonth = (ym) => {
  if (!ym) return '—';
  const [y, m] = ym.split('-');
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const fmtTime = (d) =>
  new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const currentMonth = () => new Date().toISOString().slice(0, 7);

export const saveAuth = (token, user) => {
  localStorage.setItem('ac_token', token);
  localStorage.setItem('ac_user', JSON.stringify(user));
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('ac_user')); } catch { return null; }
};

export const clearAuth = () => {
  localStorage.removeItem('ac_token');
  localStorage.removeItem('ac_user');
};
