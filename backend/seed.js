require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { User, ClubTerm, PanelMember, Notification, Message } = require('./models');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await Promise.all([
    User.deleteMany({}), ClubTerm.deleteMany({}),
    PanelMember.deleteMany({}), Notification.deleteMany({}), Message.deleteMany({})
  ]);
  console.log('Cleared existing data');

  // Club Term
  const term = await ClubTerm.create({
    label: '2025-26', startDate: new Date('2025-07-01'),
    endDate: new Date('2026-06-30'), isActive: true
  });

  const hash = await bcrypt.hash('demo123', 12);

  // Users
  const users = await User.insertMany([
    { fname:'Rony',    lname:'Das',    email:'rony@agnichakra.in',   phone:'9831000001', passwordHash:hash, city:'Kolkata', plan:'PLATINUM', role:'SUPER_ADMIN', status:'ACTIVE', joinedAt:'2024-07-01' },
    { fname:'Priya',   lname:'Ghosh',  email:'priya@demo.com',       phone:'9831000002', passwordHash:hash, city:'Kolkata', plan:'PLATINUM', role:'PANEL',       status:'ACTIVE', joinedAt:'2024-07-05' },
    { fname:'Biplab',  lname:'Roy',    email:'biplab@demo.com',      phone:'9831000003', passwordHash:hash, city:'Kolkata', plan:'PLATINUM', role:'PANEL',       status:'ACTIVE', joinedAt:'2024-07-08' },
    { fname:'Debjani', lname:'Paul',   email:'debjani@demo.com',     phone:'9831000004', passwordHash:hash, city:'Howrah',  plan:'PLATINUM', role:'PANEL',       status:'ACTIVE', joinedAt:'2024-07-10' },
    { fname:'Arjun',   lname:'Sen',    email:'arjun@demo.com',       phone:'9831000005', passwordHash:hash, city:'Kolkata', plan:'GOLD',     role:'MEMBER',      status:'ACTIVE', joinedAt:'2024-08-01' },
    { fname:'Sunita',  lname:'Mondal', email:'sunita@demo.com',      phone:'9831000006', passwordHash:hash, city:'Kolkata', plan:'SILVER',   role:'MEMBER',      status:'ACTIVE', joinedAt:'2024-09-01' },
    { fname:'Ravi',    lname:'Das',    email:'ravi@demo.com',        phone:'9831000007', passwordHash:hash, city:'Kolkata', plan:'SILVER',   role:'MEMBER',      status:'PENDING', joinedAt:'2025-06-20' },
  ]);

  // Panel
  await PanelMember.insertMany([
    { userId:users[1]._id, termId:term._id, panelRole:'President',  isActive:true },
    { userId:users[2]._id, termId:term._id, panelRole:'Secretary',  isActive:true },
    { userId:users[3]._id, termId:term._id, panelRole:'Treasurer',  isActive:true },
  ]);

  // Notifications
  await Notification.insertMany([
    { fromId:users[1]._id, target:'ALL',      title:'June Meeting', body:'Monthly meeting on 28th June 2025 at Agnichakra Club Hall. All members must attend.', readBy:[users[0]._id] },
    { fromId:users[2]._id, target:'ALL',      title:'June Dues Reminder', body:'Please clear your June membership dues before 30th June to avoid suspension.', readBy:[] },
    { fromId:users[3]._id, target:'PLATINUM', title:'Platinum Members AGM', body:'Annual General Meeting for Platinum members on 25th June at 7 PM.', readBy:[users[0]._id, users[1]._id] },
  ]);

  // Messages
  await Message.insertMany([
    { fromId:users[4]._id, subject:'Request: Library Access', body:'I would like to request access to the club library for research purposes.', status:'REPLIED',
      replies:[{ fromId:users[2]._id, body:'Noted, Arjun. Library is open Mon–Fri 10 AM–6 PM. Your card will be activated by tomorrow.', createdAt:new Date() }] },
    { fromId:users[5]._id, subject:'Complaint: Parking Issue', body:'The parking area near Gate 2 has been blocked for 3 days. Please look into this urgently.', status:'OPEN', replies:[] },
  ]);

  console.log('✅ Seed complete!');
  console.log('\nDemo login credentials (password: demo123):');
  console.log('  Super Admin : rony@agnichakra.in');
  console.log('  Panel       : priya@demo.com');
  console.log('  Member      : arjun@demo.com');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
