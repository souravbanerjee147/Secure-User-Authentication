const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db.js');

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
    console.log('Received body:', req.body);
    const { username, email, password } = req.body;

    db.query('SELECT * FROM register WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('MySQL error during email check:', err);
            return res.status(500).json({ msg: 'Database error during email check', err });
        }

        if (results.length > 0) {
            return res.status(400).json({ msg: 'Email already exists' });
        }

        console.log('Password to hash:', password);
        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            db.query(
                'INSERT INTO register (username, email, password) VALUES (?, ?, ?)', // ✅ fixed field name
                [username, email, hashedPassword],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ msg: 'Database error during registration' });
                    }
                    res.status(201).json({ msg: 'User registered successfully' });
                }
            );
        } catch (hashErr) {
            console.error('Hashing Error:', hashErr);
            return res.status(500).json({ msg: 'Password hashing failed', error: hashErr.message });
        }
    });
});

// Login Route
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM register WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ msg: 'Database error during login' });
        if (results.length === 0) return res.status(400).json({ msg: 'Invalid credentials' });

        const user = results[0];

        try {
            const isMatch = await bcrypt.compare(password, user.password); // ✅ match correct column

            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

            req.session.user = { id: user.id, username: user.username };
            res.json({ msg: 'Login successful', user: req.session.user });
        } catch (compareErr) {
            return res.status(500).json({ msg: 'Password verification failed' });
        }
    });
});

// Protected Route
router.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ msg: 'Unauthorized' });
    }

    res.json({ msg: `Welcome, ${req.session.user.username}` });
});

// Logout Route
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ msg: 'Logged out successfully' });
    });
});

module.exports = router;
