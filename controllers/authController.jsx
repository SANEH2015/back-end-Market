// authController.js
const admin = require('../firebaseAdmin');

// Register a new user
exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
        });
        res.status(201).json({ message: 'User registered', userId: userRecord.uid });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Log in a user (optional: Firebase Client SDK usually handles this client-side)
exports.login = async (req, res) => {
    const { idToken } = req.body; // Firebase client will pass the ID token on login

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        res.json({ message: 'User authenticated', uid: decodedToken.uid });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
