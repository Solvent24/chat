const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('🌱 Seeding sample users...');
    
    // Delete existing users
    await User.deleteMany({});
    
    // Create sample users
    const sampleUsers = [
      { username: 'User One', email: 'user1@test.com', password: '123456' },
      { username: 'User Two', email: 'user2@test.com', password: '123456' },
      { username: 'Alice', email: 'alice@test.com', password: '123456' },
      { username: 'Bob', email: 'bob@test.com', password: '123456' }
    ];

    for (let userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({
        ...userData,
        password: hashedPassword,
        avatar: '👤'
      });
    }

    console.log('✅ 4 Sample Users Created!');
    console.log('📧 Emails: user1@test.com, user2@test.com, alice@test.com, bob@test.com');
    console.log('🔑 Password: 123456');
    
    mongoose.connection.close();
  })
  .catch(err => console.error('❌ Seed Error:', err));