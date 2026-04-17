// Script to send temporary password emails to all users without a password
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { generateAndStoreTemporaryPassword, sendWelcomeEmailWithPassword } = require('../src/services/emailService');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({ passwordHash: { $in: [null, ''] } });
  console.log(`Found ${users.length} users without a password.`);
  for (const user of users) {
    const { tempPassword } = await generateAndStoreTemporaryPassword(user._id);
    await user.save();
    await sendWelcomeEmailWithPassword(user.email, user.name || 'Alumni', tempPassword);
    console.log(`Sent temp password to: ${user.email}`);
  }
  await mongoose.disconnect();
  console.log('Done!');
}

main().catch(err => { console.error(err); process.exit(1); });
