const Product = require('../models/Product'); // Adjust the path as necessary

// Function to add a product
const addProduct = async (req, res) => {
    try {
        const { name, price, description } = req.body;

        // Create a new product instance
        const newProduct = new Product({
            name,
            price,
            description,
            available: true, // Default value
        });

        // Check if an image was uploaded
        if (req.file) {
            newProduct.image = req.file.path; // Assuming you're storing the image path
        }

        // Save the product to the database
        const savedProduct = await newProduct.save();

        // Send the saved product back in the response
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Failed to add product' });
    }
};

// Function to get all products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
};

module.exports = {
    addProduct,
    getProducts,
};
