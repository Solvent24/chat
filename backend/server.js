// server.js - SIMPLIFIED WORKING VERSION
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chat'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.log('❌ MySQL Connection Error:', err.message);
    console.log('💡 Please start MySQL: net start MySQL');
    return;
  }
  console.log('✅ Connected to MySQL database "chat"');
  
  // Create simple users table
  db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.log('❌ Table creation error:', err.message);
    } else {
      console.log('✅ Users table ready');
    }
  });
});

// ✅ SIMPLE REGISTER ENDPOINT
app.post('/api/register', async (req, res) => {
  console.log('🔔 Registration attempt received:', req.body);
  
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      console.log('❌ Missing fields');
      return res.status(400).json({ 
        message: 'Please fill in all fields',
        received: { name: !!name, email: !!email, password: !!password }
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check if user exists
    db.query(
      'SELECT id FROM users WHERE email = ?',
      [email],
      async (err, results) => {
        if (err) {
          console.log('❌ Database query error:', err.message);
          return res.status(500).json({ 
            message: 'Database error',
            error: err.message 
          });
        }

        if (results.length > 0) {
          console.log('❌ User already exists:', email);
          return res.status(400).json({ 
            message: 'User already exists with this email' 
          });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        console.log('🔑 Password hashed successfully');

        // Create user
        db.query(
          'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
          [name, email, passwordHash],
          (err, result) => {
            if (err) {
              console.log('❌ User creation error:', err.message);
              return res.status(500).json({ 
                message: 'Error creating user',
                error: err.message 
              });
            }

            console.log('✅ User created with ID:', result.insertId);

            // Generate token
            const token = jwt.sign(
              { userId: result.insertId },
              'your_jwt_secret',
              { expiresIn: '7d' }
            );

            // Return success
            res.status(201).json({
              message: 'User created successfully',
              token,
              user: {
                id: result.insertId,
                name: name,
                email: email
              }
            });
            
            console.log('🎉 Registration successful for:', email);
          }
        );
      }
    );

  } catch (error) {
    console.log('❌ Unexpected error:', error);
    res.status(500).json({ 
      message: 'Registration failed',
      error: error.message 
    });
  }
});

// ✅ SIMPLE LOGIN ENDPOINT
app.post('/api/login', (req, res) => {
  console.log('🔔 Login attempt:', req.body.email);
  
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) {
        console.log('❌ Login database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      const user = results[0];

      // Check password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id },
        'your_jwt_secret',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
      
      console.log('✅ Login successful for:', email);
    }
  );
});

// ✅ HEALTH CHECK
app.get('/api/health', (req, res) => {
  db.query('SELECT 1 as test', (err, results) => {
    if (err) {
      return res.status(500).json({ 
        status: 'ERROR', 
        database: 'DISCONNECTED',
        error: err.message 
      });
    }
    res.json({ 
      status: 'OK', 
      database: 'CONNECTED',
      message: 'Server is running',
      test: results[0].test
    });
  });
});

// ✅ TEST DATABASE
app.get('/api/test-db', (req, res) => {
  db.query('SHOW TABLES', (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: err.message,
        message: 'Database connection failed' 
      });
    }
    res.json({ 
      tables: results,
      message: 'Database is accessible' 
    });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Check health: http://localhost:${PORT}/api/health`);
  console.log(`📊 Test database: http://localhost:${PORT}/api/test-db`);
});