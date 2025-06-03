const express = require('express');
const router = express.Router();
const College = require('../models/College');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Middleware to handle CORS
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://websitecreator-navy.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Generate website
router.post('/generate', async (req, res) => {
    try {
        const collegeData = req.body;
        
        // Create a new college document
        const college = new College(collegeData);
        await college.save();

        // Generate HTML template
        const html = generateWebsiteTemplate(college);
        
        res.json({ 
            html,
            collegeId: college._id 
        });
    } catch (error) {
        console.error('Error generating website:', error);
        res.status(500).json({ message: 'Error generating website' });
    }
});

// Get all colleges for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const colleges = await College.find({ createdBy: req.user._id });
        res.json(colleges);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single college
router.get('/:id', auth, async (req, res) => {
    try {
        const college = await College.findOne({ 
            _id: req.params.id,
            createdBy: req.user._id 
        });
        
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }
        res.json(college);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create college
router.post('/', auth, async (req, res) => {
    try {
        const college = new College({
            ...req.body,
            createdBy: req.user._id
        });

        await college.save();
        res.status(201).json(college);
    } catch (error) {
        console.error('Error creating college:', error);
        res.status(400).json({ error: error.message });
    }
});

// Update college
router.patch('/:id', auth, async (req, res) => {
    try {
        const college = await College.findOne({ 
            _id: req.params.id,
            createdBy: req.user._id 
        });
        
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }

        Object.keys(req.body).forEach(key => {
            college[key] = req.body[key];
        });

        const updatedCollege = await college.save();
        res.json(updatedCollege);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete college
router.delete('/:id', auth, async (req, res) => {
    try {
        const college = await College.findOne({ 
            _id: req.params.id,
            createdBy: req.user._id 
        });
        
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }

        await college.deleteOne();
        res.json({ message: 'College deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Helper function to generate website HTML
function generateWebsiteTemplate(college) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${college.name}</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
        <!-- Header -->
        <header class="bg-blue-600 text-white p-6">
            <div class="container mx-auto">
                <h1 class="text-4xl font-bold">${college.name}</h1>
                <p class="mt-2">${college.description}</p>
            </div>
        </header>

        <!-- Contact Information -->
        <section class="py-8 bg-white">
            <div class="container mx-auto px-4">
                <h2 class="text-2xl font-bold mb-4">Contact Us</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p><strong>Email:</strong> ${college.contact.email}</p>
                        <p><strong>Phone:</strong> ${college.contact.phone}</p>
                    </div>
                    <div>
                        <p><strong>Address:</strong></p>
                        <p>${college.address.street}</p>
                        <p>${college.address.city}, ${college.address.state} ${college.address.zipCode}</p>
                        <p>${college.address.country}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-8">
            <div class="container mx-auto px-4 text-center">
                <p>&copy; ${new Date().getFullYear()} ${college.name}. All rights reserved.</p>
            </div>
        </footer>
    </body>
    </html>
    `;
}

module.exports = router; 