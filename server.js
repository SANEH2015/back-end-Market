const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this folder exists or handle the creation
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append the file extension
    },
});
const upload = multer({ storage });

// Create a Product model
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    available: { type: Boolean, default: true },
    image: { type: String }, // Store image path
});

const Product = mongoose.model('Product', ProductSchema);

// Product routes
const productRoutes = express.Router();

// Route to add a new product
productRoutes.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, price, description } = req.body;
        const newProduct = new Product({
            name,
            price,
            description,
            image: req.file ? req.file.path : null, // Save image path
        });
        await newProduct.save();
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

        const updateData = {
            name,
            price,
            description,
        };

        if (req.file) {
            updateData.image = req.file.path; // Update image path
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product' });
    }
});

// Route to get all products
productRoutes.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Route to get a single product by ID
productRoutes.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error fetching product' });
    }
});

// Use the product routes
app.use('/api/products', productRoutes);

// Authentication routes (assuming you have these defined)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
