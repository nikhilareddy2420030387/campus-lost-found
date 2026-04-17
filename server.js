const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // ✅ FIXED

// -------------------- MIDDLEWARE --------------------
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static frontend files
app.use(express.static(__dirname));

// -------------------- MOCK DATABASE --------------------
const db = {
    student: [
        { id: '2420030387', password: 'klh@1234' },
        { id: '2420030742', password: 'klh@1234' },
        { id: '2420030617', password: 'klh@1234' },
        { id: '2420030062', password: 'klh@1234' },
    ],
    staff: [
        { id: '1010', password: '1234' },
        { id: '1020', password: '1234' },
        { id: '1030', password: '1234' },
    ]
};

// -------------------- LOGIN API --------------------
app.post('/api/login', (req, res) => {
    const { id, password, role } = req.body;

    if (!id || !password || !role) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    if (role !== 'student' && role !== 'staff') {
        return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = db[role].find(u => u.id === id);

    if (!user) {
        return res.status(401).json({ success: false, message: 'Wrong username' });
    }

    if (user.password !== password) {
        return res.status(401).json({ success: false, message: 'Wrong password' });
    }

    // Admin override
    const finalRole = id === '2420030387' ? 'admin' : role;

    res.json({
        success: true,
        message: 'Login successful',
        user: {
            id: `${id}@klh.edu.in`,
            role: finalRole
        }
    });
});

// -------------------- ITEMS --------------------
let items = [];

// Get all items
app.get('/api/items', (req, res) => {
    res.json(items);
});

// Add item
app.post('/api/items', (req, res) => {
    const newItem = {
        ...req.body,
        id: Date.now(),
        claimed: false,
        claimedBy: null,
        recovered: false,
        createdAt: new Date()
    };

    items.unshift(newItem);
    res.status(201).json({ success: true, item: newItem });
});

// Claim item
app.put('/api/items/:id/claim', (req, res) => {
    const itemId = Number(req.params.id);
    const { claimedBy } = req.body;

    const item = items.find(i => i.id === itemId);

    if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.claimed || item.recovered) {
        return res.status(400).json({ success: false, message: 'Item already claimed or recovered' });
    }

    if (item.reportedBy === claimedBy) {
        return res.status(400).json({ success: false, message: 'You cannot claim your own item' });
    }

    item.claimed = true;
    item.claimedBy = claimedBy;
    item.claimedAt = new Date();

    res.json({ success: true, item });
});

// Recover item
app.put('/api/items/:id/recover', (req, res) => {
    const itemId = Number(req.params.id);
    const item = items.find(i => i.id === itemId);

    if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
    }

    item.recovered = true;
    item.recoveredAt = new Date();

    res.json({ success: true, item });
});

// -------------------- FRONTEND --------------------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});