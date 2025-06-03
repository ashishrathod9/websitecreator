const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Website = require('../models/Website');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');

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

// Download website code
router.get('/download/:id', async (req, res) => {
  try {
    const website = await Website.findById(req.params.id);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    // Create a temporary directory for the files
    const tempDir = path.join(__dirname, '../temp', website._id.toString());
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate HTML file
    const htmlContent = generateHTML(website);
    fs.writeFileSync(path.join(tempDir, 'index.html'), htmlContent);

    // Generate CSS file
    const cssContent = generateCSS(website);
    fs.writeFileSync(path.join(tempDir, 'styles.css'), cssContent);

    // Generate JavaScript file
    const jsContent = generateJavaScript(website);
    fs.writeFileSync(path.join(tempDir, 'script.js'), jsContent);

    // Create a ZIP file
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Set the response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${website.collegeName.toLowerCase().replace(/\s+/g, '-')}-website.zip`);

    // Pipe the archive to the response
    archive.pipe(res);

    // Add the files to the archive
    archive.directory(tempDir, false);

    // Finalize the archive
    await archive.finalize();

    // Clean up the temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (error) {
    console.error('Error generating download:', error);
    res.status(500).json({ message: error.message });
  }
});

// Helper functions to generate the website files
function generateHTML(website) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${website.collegeName}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">${website.collegeName}</div>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#programs">Programs</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="home" class="hero">
            <h1>Welcome to ${website.collegeName}</h1>
            <p>${website.description || 'Empowering minds, shaping futures'}</p>
        </section>

        <section id="about" class="about">
            <h2>About Us</h2>
            <p>${website.description || 'We are committed to providing quality education and fostering academic excellence.'}</p>
        </section>

        <section id="programs" class="programs">
            <h2>Our Programs</h2>
            <div class="program-grid">
                ${website.features ? Object.entries(website.features)
                  .filter(([_, enabled]) => enabled)
                  .map(([feature]) => `<div class="program-card">
                    <h3>${feature.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    <p>Learn more about our ${feature.toLowerCase()} program.</p>
                  </div>`).join('') : ''}
            </div>
        </section>

        <section id="contact" class="contact">
            <h2>Contact Us</h2>
            <div class="contact-info">
                <p>Email: ${website.contact?.email || 'contact@college.edu'}</p>
                <p>Phone: ${website.contact?.phone || '(123) 456-7890'}</p>
                <p>Address: ${website.location?.street || '123 College Street'}, ${website.location?.city || 'City'}, ${website.location?.state || 'State'} ${website.location?.zipCode || '12345'}</p>
            </div>
        </section>
    </main>

    <footer>
        <p>&copy; ${new Date().getFullYear()} ${website.collegeName}. All rights reserved.</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>`;
}

function generateCSS(website) {
  return `/* Global Styles */
:root {
    --primary-color: ${website.colorScheme || '#1a365d'};
    --secondary-color: #f8f9fa;
    --text-color: #333;
    --accent-color: #007bff;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: var(--text-color);
}

/* Header Styles */
header {
    background-color: var(--primary-color);
    color: white;
    padding: 1rem 0;
}

nav {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
}

nav ul {
    display: flex;
    list-style: none;
}

nav ul li {
    margin-left: 2rem;
}

nav ul li a {
    color: white;
    text-decoration: none;
    transition: color 0.3s ease;
}

nav ul li a:hover {
    color: var(--accent-color);
}

/* Hero Section */
.hero {
    background-color: var(--secondary-color);
    padding: 4rem 2rem;
    text-align: center;
}

.hero h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
}

/* About Section */
.about {
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.about h2 {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

/* Programs Section */
.programs {
    background-color: var(--secondary-color);
    padding: 4rem 2rem;
}

.programs h2 {
    text-align: center;
    color: var(--primary-color);
    margin-bottom: 2rem;
}

.program-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.program-card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.program-card:hover {
    transform: translateY(-5px);
}

.program-card h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

/* Contact Section */
.contact {
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.contact h2 {
    color: var(--primary-color);
    margin-bottom: 2rem;
}

.contact-info {
    background: var(--secondary-color);
    padding: 2rem;
    border-radius: 8px;
}

/* Footer */
footer {
    background-color: var(--primary-color);
    color: white;
    text-align: center;
    padding: 2rem;
    margin-top: 4rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    nav {
        flex-direction: column;
        text-align: center;
    }

    nav ul {
        margin-top: 1rem;
    }

    nav ul li {
        margin: 0 1rem;
    }

    .hero h1 {
        font-size: 2rem;
    }
}`;
}

function generateJavaScript(website) {
  return `// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add animation to program cards
const programCards = document.querySelectorAll('.program-card');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

programCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});

// Mobile menu toggle
const createMobileMenu = () => {
    const nav = document.querySelector('nav ul');
    const menuButton = document.createElement('button');
    menuButton.className = 'mobile-menu-button';
    menuButton.innerHTML = '☰';
    
    document.querySelector('nav').insertBefore(menuButton, nav);
    
    menuButton.addEventListener('click', () => {
        nav.classList.toggle('show');
    });
};

// Initialize mobile menu if screen width is small
if (window.innerWidth <= 768) {
    createMobileMenu();
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-button')) {
        createMobileMenu();
    }
});`;
}

module.exports = router; 