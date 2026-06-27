const PLANS = {
  SILVER:   { label: 'Silver',   price: 300  },
  GOLD:     { label: 'Gold',     price: 500  },
  PLATINUM: { label: 'Platinum', price: 1000 },
};

const PANEL_ROLES = [
  'President', 'Vice President', 'Secretary',
  'Joint Secretary', 'Treasurer', 'Cultural Secretary', 'Sports Secretary'
];

const buildUpiLink = (plan, month) => {
  const { label, price } = PLANS[plan] || PLANS.SILVER;
  const params = new URLSearchParams({
    pa: process.env.CLUB_UPI_ID || 'agnichakra@okaxis',
    pn: process.env.CLUB_NAME   || 'Agnichakra Club',
    am: price,
    cu: 'INR',
    tn: `${process.env.CLUB_NAME || 'Agnichakra Club'} ${label} – ${month}`,
  });
  return `upi://pay?${params.toString()}`;
};

const currentMonth = () => new Date().toISOString().slice(0, 7);

module.exports = { PLANS, PANEL_ROLES, buildUpiLink, currentMonth };
