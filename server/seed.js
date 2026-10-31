
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');
const Complaint = require('./models/Complaint');

const requiredEnv = [
  'MONGODB_URI',
  'ADMIN_PASSWORD',
  'ENGINEER_PASSWORD',
  'USER_PASSWORD'
];

const missing = requiredEnv.filter(
  (key) => !process.env[key]
);

if (missing.length) {
  console.error(
    `Missing environment variables: ${missing.join(', ')}`
  );
  process.exit(1);
}

const users = [
  {
    name: process.env.ADMIN_NAME || 'QES Admin',
    email: (process.env.ADMIN_EMAIL || 'admin@qes.local').toLowerCase(),
    password: process.env.ADMIN_PASSWORD,
    role: 'admin',
    serviceNumber: 'QES-ADMIN-001',
    unit: 'QES Headquarters',
    quarterNumber: 'HQ-ADMIN',
    phone: ''
  },
  {
    name: process.env.ENGINEER_NAME || 'QES Engineer',
    email: (process.env.ENGINEER_EMAIL || 'engineer@qes.local').toLowerCase(),
    password: process.env.ENGINEER_PASSWORD,
    role: 'engineer',
    serviceNumber: 'QES-ENG-001',
    unit: 'Engineering Unit',
    quarterNumber: 'ENG-01',
    phone: ''
  },
  {
    name: process.env.DEMO_USER_NAME || 'Demo User',
    email: (process.env.DEMO_USER_EMAIL || 'user@qes.local').toLowerCase(),
    password: process.env.USER_PASSWORD,
    role: 'user',
    serviceNumber: 'QES-USER-001',
    unit: 'Residential Unit',
    quarterNumber: 'A-101',
    phone: ''
  }
];

async function upsertUser(userData) {
  let user = await User.findOne({
    email: userData.email
  });

  if (!user) {
    user = new User(userData);
  } else {
    Object.assign(user, userData);
  }

  // User model should hash password in its pre-save hook.
  await user.save();

  return user;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Connected to MongoDB');

    const [admin, engineer, demoUser] = await Promise.all(
      users.map(upsertUser)
    );

    console.log('Seed users created/updated:');
    console.log('Admin:', admin.email);
    console.log('Engineer:', engineer.email);
    console.log('User:', demoUser.email);

    const complaintCount = await Complaint.countDocuments();

    if (complaintCount === 0) {
      await Complaint.insertMany([
        {
          title: 'Water leakage in bathroom',
          description:
            'Water is continuously leaking from the bathroom pipe. Please inspect and repair it.',
          category: 'Water',
          location: demoUser.quarterNumber,
          priority: 'High',
          status: 'Pending',
          createdBy: demoUser._id
        },
        {
          title: 'Electrical switch not working',
          description:
            'The main room switch is not functioning properly and needs inspection.',
          category: 'Electricity',
          location: demoUser.quarterNumber,
          priority: 'Medium',
          status: 'Assigned',
          createdBy: demoUser._id,
          assignedTo: engineer._id,
          assignedAt: new Date()
        },
        {
          title: 'Repair damaged door hinge',
          description:
            'The bedroom door hinge is loose and the door does not close properly.',
          category: 'Furniture',
          location: demoUser.quarterNumber,
          priority: 'Low',
          status: 'In Progress',
          createdBy: demoUser._id,
          assignedTo: engineer._id,
          assignedAt: new Date()
        }
      ]);

      console.log('3 sample complaints added.');
    } else {
      console.log(
        `Skipped sample complaints. Existing complaints: ${complaintCount}`
      );
    }

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
