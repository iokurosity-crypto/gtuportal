const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const bcrypt = require('bcrypt');
const { sendWelcomeEmailWithPassword } = require('../src/services/emailService');

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('✗ Error: MONGO_URI not found in .env');
  process.exit(1);
}

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('\n⚠️  WARNING: SMTP credentials not configured! Emails will NOT be sent.');
  console.warn('   Please configure SMTP_USER and SMTP_PASS in .env file.\n');
}

mongoose.connect(mongoUri)
  .then(() => console.log('✓ MongoDB connected!'))
  .catch(err => {
    console.error('✗ MongoDB error:', err.message);
    process.exit(1);
  });

const args = process.argv.slice(2);
const csvArg = args.find(a => !a.startsWith('-'));
const forceFlag = args.includes('--force');
const csvFilePath = csvArg
  ? path.resolve(process.cwd(), csvArg)
  : path.resolve(__dirname, '../data/alumni.csv');

if (!fs.existsSync(csvFilePath)) {
  console.error(`✗ File not found: ${csvFilePath}`);
  process.exit(1);
}

const stats = { total: 0, created: 0, skipped: 0, emailsSent: 0, failed: 0, emailFailed: 0 };

// Generate temp password: firstName@batch_XXXX
const generateTempPassword = (name, batch) => {
  const firstName = name.split(' ')[0].toLowerCase();
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${firstName}@${batch}_${randomNum}`;
};

console.log(`\n📁 Import from: ${csvFilePath}\n`);

const processAlumni = async () => {
  const rows = [];
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📊 Found ${rows.length} rows to process\n`);

  // 🔄 If --force flag, delete existing users from this CSV
  if (forceFlag) {
    console.log('🔄 Force flag detected - deleting existing users from CSV...\n');
    const emailsToDelete = rows
      .map(row => ((row.email || row.EMAIL || '').toLowerCase().trim()))
      .filter(email => email);
    
    if (emailsToDelete.length > 0) {
      const deleteResult = await User.deleteMany({ email: { $in: emailsToDelete } });
      console.log(`✓ Deleted ${deleteResult.deletedCount} existing users\n`);
    }
  }

  for (const row of rows) {
    stats.total++;
    try {
      const name = row.name || row.Name || '';
      const email = (row.email || row.EMAIL || '').toLowerCase().trim();
      const department = row.department || row.Department || '';
      const batch = row.batch || row.Batch || '';

      if (!name || !email || !department || !batch) {
        stats.skipped++;
        console.log(`⏭️  Skipped: Missing required fields (name, email, department, batch)`);
        continue;
      }

      const existing = await User.findOne({ email });
      if (existing) {
        stats.skipped++;
        console.log(`⏭️  ${email}: Already exists - skipped`);
        continue;
      }

      const plainTempPassword = generateTempPassword(name, batch);
      const hashedTemp = await bcrypt.hash(plainTempPassword, 10);

      try {
        // 📧 SEND EMAIL FIRST - Before creating profile
        console.log(`[PROCESS] 📧 Sending email to ${email}...`);
        const emailResult = await sendWelcomeEmailWithPassword(email, name, plainTempPassword);
        
        if (emailResult.skipped) {
          console.warn(`⚠️  EMAIL SKIPPED (SMTP not configured) - Profile NOT created`);
          stats.skipped++;
          continue;
        } else if (!emailResult.success) {
          stats.emailFailed++;
          console.error(`✗ EMAIL FAILED: ${emailResult.error} - Profile NOT created`);
          console.log(`   Temp password for manual send: ${plainTempPassword}`);
          continue;
        }

        // ✅ EMAIL SENT SUCCESSFULLY - Now create profile
        console.log(`[PROCESS] ✓ Email sent successfully! Now creating profile...`);
        
        // Set temp password expiry to 24 hours from now
        const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        const newUser = new User({
          name,
          email,
          department,
          batch,
          temporaryPassword: hashedTemp,
          temporaryPasswordExpires: expiryTime,
          passwordHash: null,
          isActive: false,
          isFirstLogin: true,
          isProfileComplete: false,
          role: 'alumni'
        });

        await newUser.save();
        stats.created++;
        stats.emailsSent++;
        
        console.log(`✓ ✅ SUCCESS: ${name} (${email})`);
        console.log(`   Email sent + Profile created in database`);
        console.log(`   ⚠️  TEMPORARY PASSWORD (share with user):`);
        console.log(`   📧 PASSWORD: ${plainTempPassword}`);
        console.log(`   📧 Email: ${email}`);
        console.log(`   ⏰ Valid for 24 hours\n`);

      } catch (emailErr) {
        stats.emailFailed++;
        console.error(`✗ ERROR processing ${email}:`, emailErr.message);
        console.log(`   Profile NOT created - email delivery issue\n`);
      }
    } catch (err) {
      stats.failed++;
      console.error(`✗ Error processing row:`, err.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total rows processed: ${stats.total}`);
  console.log(`Users created:        ${stats.created}`);
  console.log(`Emails sent:          ${stats.emailsSent}`);
  console.log(`Email failures:       ${stats.emailFailed}`);
  console.log(`Rows skipped:         ${stats.skipped}`);
  console.log(`Processing errors:    ${stats.failed}`);
  console.log('='.repeat(60));

  if (stats.emailFailed > 0) {
    console.log('\n⚠️  NOTE: Some emails failed to send.');
    console.log('   Please check your SMTP configuration in .env file:');
    console.log('   - SMTP_HOST=' + process.env.SMTP_HOST);
    console.log('   - SMTP_PORT=' + process.env.SMTP_PORT);
    console.log('   - SMTP_USER=' + process.env.SMTP_USER);
    console.log('   - SMTP_PASS is ' + (process.env.SMTP_PASS ? 'configured' : 'NOT configured'));
  }
  
  if (stats.emailsSent === stats.created) {
    console.log('\n✅ SUCCESS: All users created and emails sent!\n');
  } else if (stats.emailsSent > 0) {
    console.log(`\n⚠️  PARTIAL: ${stats.emailsSent} emails sent, ${stats.created - stats.emailsSent} failed\n`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

processAlumni().catch(err => {
  console.error('Critical error:', err);
  mongoose.disconnect().then(() => process.exit(1));
});
