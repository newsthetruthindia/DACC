/**
 * 🚀 LAUNCH RESET SCRIPT
 * 
 * Clears all placeholder/demo data from the database while preserving
 * the SUPER_ADMIN account. Run this once before going live.
 * 
 * Usage:  node reset_launch.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { User, ClubTerm, PanelMember, Payment, Notification, Message, FundTransaction } = require('./models');

async function resetForLaunch() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected!\n');

  // 1. Find the super admin
  const superAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
  if (!superAdmin) {
    console.error('❌ No SUPER_ADMIN found in the database! Aborting.');
    process.exit(1);
  }
  console.log(`🛡️  Super Admin found: ${superAdmin.fname} ${superAdmin.lname} (${superAdmin.email})`);
  console.log(`   Member ID: ${superAdmin.memberId}`);
  console.log(`   This account will be PRESERVED.\n`);

  // 2. Delete all users EXCEPT super admin
  const deletedUsers = await User.deleteMany({ _id: { $ne: superAdmin._id } });
  console.log(`👥 Deleted ${deletedUsers.deletedCount} placeholder/demo user(s)`);

  // 3. Clear all panel members
  const deletedPanel = await PanelMember.deleteMany({});
  console.log(`🏛️  Deleted ${deletedPanel.deletedCount} panel member assignment(s)`);

  // 4. Clear all payments
  const deletedPayments = await Payment.deleteMany({});
  console.log(`💳 Deleted ${deletedPayments.deletedCount} payment record(s)`);

  // 5. Clear all notifications
  const deletedNotifs = await Notification.deleteMany({});
  console.log(`🔔 Deleted ${deletedNotifs.deletedCount} notification(s)`);

  // 6. Clear all messages
  const deletedMsgs = await Message.deleteMany({});
  console.log(`💬 Deleted ${deletedMsgs.deletedCount} message(s)`);

  // 7. Clear all fund transactions
  const deletedFunds = await FundTransaction.deleteMany({});
  console.log(`💰 Deleted ${deletedFunds.deletedCount} fund transaction(s)`);

  // 8. Reset club terms - create fresh 2025-26 term
  await ClubTerm.deleteMany({});
  const newTerm = await ClubTerm.create({
    label: '2025-26',
    startDate: new Date('2025-07-01'),
    endDate: new Date('2026-06-30'),
    isActive: true,
  });
  console.log(`\n📅 Fresh club term created: ${newTerm.label} (${newTerm.startDate.toDateString()} → ${newTerm.endDate.toDateString()})`);

  console.log('\n' + '═'.repeat(55));
  console.log('🚀 DATABASE RESET COMPLETE — READY FOR LAUNCH!');
  console.log('═'.repeat(55));
  console.log(`\n✅ Super Admin login preserved:`);
  console.log(`   Email: ${superAdmin.email}`);
  console.log(`   (use your existing password to log in)\n`);

  await mongoose.disconnect();
}

resetForLaunch().catch(err => {
  console.error('❌ Reset failed:', err);
  process.exit(1);
});
