const PLANS = {
  REGULAR:  { label: 'Standard Member', price: 1100 },
  SILVER:   { label: 'Standard Member', price: 1100 },
  GOLD:     { label: 'Standard Member', price: 1100 },
  PLATINUM: { label: 'Standard Member', price: 1100 },
};

const PANEL_ROLES = [
  'President', 'Vice President', 'Secretary',
  'Joint Secretary', 'Treasurer', 'Cultural Secretary', 'Sports Secretary'
];

const buildUpiLink = (plan, month, customAmount = null, customNote = null) => {
  const { label, price } = PLANS[plan] || PLANS.REGULAR;
  const amt = customAmount ? Number(customAmount) : price;
  const note = customNote || `${process.env.CLUB_NAME || 'Agnichakra Club'} ${label} – ${month}`;
  const params = new URLSearchParams({
    pa: process.env.CLUB_UPI_ID || 'agnichakra@okaxis',
    pn: process.env.CLUB_NAME   || 'Agnichakra Club',
    am: amt,
    cu: 'INR',
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
};

const currentMonth = () => new Date().toISOString().slice(0, 7);

module.exports = { PLANS, PANEL_ROLES, buildUpiLink, currentMonth };

