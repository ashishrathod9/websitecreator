const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Middleware to handle CORS
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://websitecreator-navy.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Get all templates
router.get('/', async (req, res) => {
    try {
        // For now, return a static list of templates
        const templates = [
            {
                id: 1,
                name: 'Modern Academic',
                description: 'A modern and clean design suitable for educational institutions',
                features: ['Responsive Design', 'News Section', 'Events Calendar', 'Department Pages'],
                previewImage: 'https://wallpaperaccess.com/full/4723250.jpg'
            },
            {
                id: 2,
                name: 'Classic College',
                description: 'Traditional design with a professional look',
                features: ['Faculty Directory', 'Course Catalog', 'Student Portal', 'Research Showcase'],
                previewImage: 'https://wallpaperaccess.com/full/4723250.jpg'
            },
            {
                id: 3,
                name: 'Tech University',
                description: 'Contemporary design with focus on technology and innovation',
                features: ['Interactive Campus Map', 'Virtual Tour', 'Online Admissions', 'Research Portal'],
                previewImage: 'https://wallpaperaccess.com/full/4723250.jpg'
            }
        ];
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get template by ID
router.get('/:id', async (req, res) => {
    try {
        // For now, return a static template
        const template = {
            id: parseInt(req.params.id),
            name: 'Modern Academic',
            description: 'A modern and clean design suitable for educational institutions',
            features: ['Responsive Design', 'News Section', 'Events Calendar', 'Department Pages'],
            previewImage: '/templates/modern-academic.jpg',
            sections: [
                {
                    name: 'Header',
                    components: ['Logo', 'Navigation Menu', 'Search Bar']
                },
                {
                    name: 'Hero Section',
                    components: ['Slideshow', 'Welcome Message', 'Quick Links']
                },
                {
                    name: 'Main Content',
                    components: ['News Grid', 'Events Calendar', 'Department Showcase']
                },
                {
                    name: 'Footer',
                    components: ['Contact Information', 'Social Media Links', 'Quick Links']
                }
            ]
        };
        res.json(template);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Generate website from template
router.post('/generate', [
    body('templateId').isInt(),
    body('collegeId').isMongoId(),
    body('customizations').isObject()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Here you would implement the actual website generation logic
        // For now, return a success message
        res.status(201).json({
            message: 'Website generation started',
            jobId: 'job_' + Date.now(),
            status: 'processing'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get generation status
router.get('/status/:jobId', async (req, res) => {
    try {
        // Here you would check the actual generation status
        // For now, return a mock status
        res.json({
            jobId: req.params.jobId,
            status: 'completed',
            progress: 100,
            result: {
                previewUrl: '/preview/website_' + req.params.jobId,
                downloadUrl: '/download/website_' + req.params.jobId
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 