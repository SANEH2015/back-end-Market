const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { storage, firestore } = require('./firebase'); // Import Firebase setup
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Configure multer for image uploads
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for multer

// Product routes
const productRoutes = express.Router();

// Route to add a new product
productRoutes.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, price, description } = req.body;

        // Upload image to Firebase Storage
        const imageBuffer = req.file.buffer;
        const imageRef = storage.ref().child(`images/${Date.now()}_${req.file.originalname}`);
        const snapshot = await imageRef.put(imageBuffer);
        const imageUrl = await snapshot.ref.getDownloadURL();

        // Create a product object to store in Firestore
        const newProduct = {
            name,
            price: parseFloat(price), // Convert price to a number
            description,
            image: imageUrl,
        };

        // Store product in Firestore
        const docRef = await firestore.collection('products').add(newProduct);
        newProduct.id = docRef.id; // Add the document ID to the product

        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Error adding product' });
    }
});

// Route to update an existing product
productRoutes.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description } = req.body;

        // Prepare update data
        const updateData = {
            name,
            price: parseFloat(price),
            description,
        };

        if (req.file) {
            const imageBuffer = req.file.buffer;
            const imageRef = storage.ref().child(`images/${Date.now()}_${req.file.originalname}`);
            const snapshot = await imageRef.put(imageBuffer);
            const imageUrl = await snapshot.ref.getDownloadURL();
            updateData.image = imageUrl; // Update image URL
        }

        // Update product in Firestore
        const docRef = firestore.collection('products').doc(id);
        await docRef.update(updateData);

        res.json({ id, ...updateData });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product' });
    }
});

// Route to get all products
productRoutes.get('/', async (req, res) => {
    try {
        const snapshot = await firestore.collection('products').get();
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Route to get a single product by ID
productRoutes.get('/:id', async (req, res) => {
    try {
        const docRef = firestore.collection('products').doc(req.params.id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error fetching product' });
    }
});

// Use the product routes
app.use('/api/products', productRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
