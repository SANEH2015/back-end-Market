const { firestore } = require('../../code-tribe-frontend/Market/src/firebase'); // Adjust the import according to your structure

// Function to add a product
const addProduct = async (req, res) => {
    try {
        const { name, price, description } = req.body;

        // Create a new product object
        const newProduct = {
            name,
            price,
            description,
            available: true, // Default value
            // Handle the image upload, if required
            image: req.file ? req.file.path : null,
        };

        // Store the product in Firestore
        const productRef = await firestore.collection('products').add(newProduct);
        const savedProduct = { id: productRef.id, ...newProduct }; // Add the document ID to the saved product

        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Failed to add product' });
    }
};

// Function to get all products
const getProducts = async (req, res) => {
    try {
        const productsSnapshot = await firestore.collection('products').get();
        const products = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
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
