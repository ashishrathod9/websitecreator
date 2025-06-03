const express = require('express');
const router = express.Router();
const College = require('../models/College');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
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

// Deliver website package
router.get('/deliver/:id', auth, async (req, res) => {
    try {
        console.log('Delivery request received for ID:', req.params.id);
        
        const college = await College.findOne({ 
            _id: req.params.id,
            createdBy: req.user._id 
        });
        
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }

        // Ensure temp directory exists
        const tempBaseDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempBaseDir)) {
            fs.mkdirSync(tempBaseDir, { recursive: true });
        }

        // Create a temporary directory for the files
        const tempDir = path.join(tempBaseDir, college._id.toString());
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Generate website files
        const htmlContent = generateWebsiteHTML(college);
        const cssContent = generateWebsiteCSS(college);
        const jsContent = generateWebsiteJS(college);
        const readmeContent = generateReadme(college);

        // Write files to temp directory
        fs.writeFileSync(path.join(tempDir, 'index.html'), htmlContent);
        fs.writeFileSync(path.join(tempDir, 'styles.css'), cssContent);
        fs.writeFileSync(path.join(tempDir, 'script.js'), jsContent);
        fs.writeFileSync(path.join(tempDir, 'README.md'), readmeContent);

        // Create a ZIP file
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        // Set the response headers
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${college.collegeName.toLowerCase().replace(/\s+/g, '-')}-website.zip`);

        // Pipe the archive to the response
        archive.pipe(res);

        // Add the files to the archive
        archive.directory(tempDir, false);

        // Finalize the archive
        await archive.finalize();

        // Clean up the temporary directory
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log('Website delivery completed successfully');
    } catch (error) {
        console.error('Error delivering website:', error);
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

// Helper function to generate website HTML
function generateWebsiteHTML(college) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${college.collegeName}</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <header>
        <nav>
            <div class="logo">${college.collegeName}</div>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#programs">Programs</a></li>
                <li><a href="#news">News</a></li>
                <li><a href="#events">Events</a></li>
                <li><a href="#facilities">Facilities</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <button class="mobile-menu-button">☰</button>
        </nav>
    </header>

    <main>
        <section id="home" class="hero">
            <div class="hero-content">
                <h1>Welcome to ${college.collegeName}</h1>
                <p>${college.description || 'Empowering minds, shaping futures'}</p>
                <a href="#contact" class="cta-button">Get in Touch</a>
            </div>
        </section>

        <section id="about" class="about">
            <div class="container">
                <h2>About Us</h2>
                <div class="about-content">
                    <p>${college.description || 'We are committed to providing quality education and fostering academic excellence.'}</p>
                    <div class="stats">
                        <div class="stat-item">
                            <h3>${college.establishedYear || '2024'}</h3>
                            <p>Established</p>
                        </div>
                        <div class="stat-item">
                            <h3>${college.departments?.length || '0'}</h3>
                            <p>Departments</p>
                        </div>
                        <div class="stat-item">
                            <h3>${college.faculty?.length || '0'}</h3>
                            <p>Faculty Members</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="programs" class="programs">
            <div class="container">
                <h2>Our Programs</h2>
                <div class="program-grid">
                    ${college.departments?.length > 0 ? 
                        college.departments.map(dept => `
                            <div class="program-card">
                                <h3>${dept.name}</h3>
                                <p>${dept.description || 'Learn more about our department.'}</p>
                                ${dept.head ? `<p class="department-head">Department Head: ${dept.head}</p>` : ''}
                            </div>
                        `).join('') : 
                        '<div class="no-programs">Programs coming soon...</div>'
                    }
                </div>
            </div>
        </section>

        <section id="news" class="news">
            <div class="container">
                <h2>Latest News</h2>
                <div class="news-grid">
                    ${college.news?.map(item => `
                        <div class="news-card">
                            ${item.image ? `<img src="${item.image}" alt="${item.title}">` : ''}
                            <div class="news-content">
                                <h3>${item.title || 'News Title'}</h3>
                                <p>${item.content || 'News content'}</p>
                                <span class="news-date">${item.date ? new Date(item.date).toLocaleDateString() : 'Date'}</span>
                            </div>
                        </div>
                    `).join('') || '<div class="no-news">No news available at the moment.</div>'}
                </div>
            </div>
        </section>

        <section id="events" class="events">
            <div class="container">
                <h2>Upcoming Events</h2>
                <div class="events-grid">
                    ${college.events?.map(event => `
                        <div class="event-card">
                            ${event.image ? `<img src="${event.image}" alt="${event.title}">` : ''}
                            <div class="event-content">
                                <h3>${event.title || 'Event Title'}</h3>
                                <p>${event.description || 'Event description'}</p>
                                <div class="event-details">
                                    <span class="event-date">${event.date ? new Date(event.date).toLocaleDateString() : 'Date'}</span>
                                    <span class="event-location">${event.location || 'Location'}</span>
                                </div>
                            </div>
                        </div>
                    `).join('') || '<div class="no-events">No upcoming events at the moment.</div>'}
                </div>
            </div>
        </section>

        <section id="facilities" class="facilities">
            <div class="container">
                <h2>Our Facilities</h2>
                <div class="facilities-grid">
                    ${college.facilities?.map(facility => `
                        <div class="facility-card">
                            ${facility.image ? `<img src="${facility.image}" alt="${facility.name}">` : ''}
                            <div class="facility-content">
                                <h3>${facility.name || 'Facility Name'}</h3>
                                <p>${facility.description || 'Facility description'}</p>
                            </div>
                        </div>
                    `).join('') || '<div class="no-facilities">No facilities information available at the moment.</div>'}
                </div>
            </div>
        </section>

        <section id="departments" class="departments">
            <div class="container">
                <h2>Our Departments</h2>
                <div class="departments-grid">
                    ${college.departments?.map(dept => `
                        <div class="department-card">
                            ${dept.image ? `<img src="${dept.image}" alt="${dept.name}">` : ''}
                            <div class="department-content">
                                <h3>${dept.name || 'Department Name'}</h3>
                                <p>${dept.description || 'Department description'}</p>
                                ${dept.head ? `<p class="department-head">Department Head: ${dept.head}</p>` : ''}
                            </div>
                        </div>
                    `).join('') || '<div class="no-departments">No departments information available at the moment.</div>'}
                </div>
            </div>
        </section>

        <section id="faculty" class="faculty">
            <div class="container">
                <h2>Our Faculty</h2>
                <div class="faculty-grid">
                    ${college.faculty?.map(member => `
                        <div class="faculty-card">
                            ${member.image ? `<img src="${member.image}" alt="${member.name}">` : ''}
                            <div class="faculty-content">
                                <h3>${member.name || 'Faculty Name'}</h3>
                                <p class="position">${member.position || 'Position'}</p>
                                <p class="department">${member.department || 'Department'}</p>
                                <p class="bio">${member.bio || 'Bio'}</p>
                                <div class="contact-info">
                                    ${member.email ? `<p>Email: ${member.email}</p>` : ''}
                                    ${member.phone ? `<p>Phone: ${member.phone}</p>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('') || '<div class="no-faculty">No faculty information available at the moment.</div>'}
                </div>
            </div>
        </section>

        <section id="courses" class="courses">
            <div class="container">
                <h2>Our Courses</h2>
                <div class="courses-grid">
                    ${college.courses?.map(course => `
                        <div class="course-card">
                            ${course.image ? `<img src="${course.image}" alt="${course.name}">` : ''}
                            <div class="course-content">
                                <h3>${course.name || 'Course Name'}</h3>
                                <p class="code">${course.code || 'Course Code'}</p>
                                <p class="description">${course.description || 'Course description'}</p>
                                <div class="course-details">
                                    ${course.credits ? `<p>Credits: ${course.credits}</p>` : ''}
                                    ${course.duration ? `<p>Duration: ${course.duration}</p>` : ''}
                                    ${course.prerequisites ? `<p>Prerequisites: ${course.prerequisites}</p>` : ''}
                                    <p>Department: ${course.department || 'Department'}</p>
                                </div>
                            </div>
                        </div>
                    `).join('') || '<div class="no-courses">No courses information available at the moment.</div>'}
                </div>
            </div>
        </section>

        <section id="research" class="research">
            <div class="container">
                <h2>Research</h2>
                <div class="research-grid">
                    ${college.research?.map(project => `
                        <div class="research-card">
                            ${project.image ? `<img src="${project.image}" alt="${project.title}">` : ''}
                            <div class="research-content">
                                <h3>${project.title || 'Research Title'}</h3>
                                <p class="description">${project.description || 'Research description'}</p>
                                <p class="department">Department: ${project.department || 'Department'}</p>
                                ${project.researchers ? `<p class="researchers">Researchers: ${project.researchers}</p>` : ''}
                                ${project.publications ? `<p class="publications">Publications: ${project.publications}</p>` : ''}
                            </div>
                        </div>
                    `).join('') || '<div class="no-research">No research information available at the moment.</div>'}
                </div>
            </div>
        </section>

        <section id="virtual-tour" class="virtual-tour">
            <div class="container">
                <h2>Virtual Tour</h2>
                <div class="virtual-tour-content">
                    ${college.virtualTour?.videoUrl ? `
                        <div class="video-container">
                            <iframe src="${college.virtualTour.videoUrl}" frameborder="0" allowfullscreen></iframe>
                        </div>
                    ` : ''}
                    ${college.virtualTour?.images?.length > 0 ? `
                        <div class="tour-images">
                            ${college.virtualTour.images.map(image => `
                                <img src="${image}" alt="Campus Tour">
                            `).join('')}
                        </div>
                    ` : ''}
                    ${college.virtualTour?.description ? `
                        <div class="tour-description">
                            <p>${college.virtualTour.description}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </section>

        <section id="admissions" class="admissions">
            <div class="container">
                <h2>Admissions</h2>
                <div class="admissions-content">
                    ${college.admissions?.requirements?.length > 0 ? `
                        <div class="requirements">
                            <h3>Requirements</h3>
                            <ul>
                                ${college.admissions.requirements.map(req => `
                                    <li>${req}</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${college.admissions?.deadlines?.length > 0 ? `
                        <div class="deadlines">
                            <h3>Important Deadlines</h3>
                            <ul>
                                ${college.admissions.deadlines.map(deadline => `
                                    <li>
                                        <strong>${deadline.title}</strong>
                                        <span>${new Date(deadline.date).toLocaleDateString()}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${college.admissions?.applicationProcess ? `
                        <div class="application-process">
                            <h3>Application Process</h3>
                            <p>${college.admissions.applicationProcess}</p>
                        </div>
                    ` : ''}
                    ${college.admissions?.contactInfo ? `
                        <div class="admissions-contact">
                            <h3>Contact Admissions</h3>
                            <p>${college.admissions.contactInfo}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </section>

        <section id="contact" class="contact">
            <div class="container">
                <h2>Contact Us</h2>
                <div class="contact-grid">
                    <div class="contact-info">
                        <h3>Get in Touch</h3>
                        <div class="contact-details">
                            <p><strong>Email:</strong> ${college.contact?.email || 'contact@college.edu'}</p>
                            <p><strong>Phone:</strong> ${college.contact?.phone || '(123) 456-7890'}</p>
                            <p><strong>Website:</strong> ${college.contact?.website || 'www.college.edu'}</p>
                        </div>
                        <div class="address">
                            <h4>Address</h4>
                            <p>${college.location?.street || '123 College Street'}</p>
                            <p>${college.location?.city || 'City'}, ${college.location?.state || 'State'} ${college.location?.zipCode || '12345'}</p>
                        </div>
                    </div>
                    <div class="contact-form">
                        <h3>Send us a Message</h3>
                        <form id="contactForm">
                            <div class="form-group">
                                <input type="text" id="name" name="name" placeholder="Your Name" required>
                            </div>
                            <div class="form-group">
                                <input type="email" id="email" name="email" placeholder="Your Email" required>
                            </div>
                            <div class="form-group">
                                <textarea id="message" name="message" placeholder="Your Message" required></textarea>
                            </div>
                            <button type="submit" class="submit-button">Send Message</button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-info">
                    <h3>${college.collegeName}</h3>
                    <p>${college.description || 'Empowering minds, shaping futures'}</p>
                </div>
                <div class="footer-links">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="#home">Home</a></li>
                        <li><a href="#about">About</a></li>
                        <li><a href="#programs">Programs</a></li>
                        <li><a href="#news">News</a></li>
                        <li><a href="#events">Events</a></li>
                        <li><a href="#facilities">Facilities</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} ${college.collegeName}. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>`;
}

// Helper function to generate website CSS
function generateWebsiteCSS(college) {
    const primaryColor = college.colors?.primary || '#1a365d';
    const secondaryColor = college.colors?.secondary || '#f8f9fa';
    const accentColor = college.colors?.accent || '#007bff';
    const textColor = college.colors?.text || '#333';
    const backgroundColor = college.colors?.background || '#ffffff';

    return `/* Global Styles */
:root {
    --primary-color: ${primaryColor};
    --secondary-color: ${secondaryColor};
    --accent-color: ${accentColor};
    --text-color: ${textColor};
    --background-color: ${backgroundColor};
    --font-family: 'Inter', sans-serif;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-family);
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

/* Header Styles */
header {
    background-color: var(--primary-color);
    color: white;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
}

nav ul {
    display: flex;
    list-style: none;
    gap: 2rem;
}

nav ul li a {
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
}

nav ul li a:hover {
    color: var(--accent-color);
}

.mobile-menu-button {
    display: none;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
}

/* Hero Section */
.hero {
    height: 100vh;
    background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80');
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    text-align: center;
    color: white;
    padding-top: 80px;
}

.hero-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem;
}

.hero h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    line-height: 1.2;
}

.hero p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
}

.cta-button {
    display: inline-block;
    padding: 1rem 2rem;
    background-color: var(--accent-color);
    color: white;
    text-decoration: none;
    border-radius: 5px;
    font-weight: 500;
    transition: background-color 0.3s ease;
}

.cta-button:hover {
    background-color: #0056b3;
}

/* About Section */
.about {
    padding: 6rem 0;
    background-color: var(--secondary-color);
}

.about h2 {
    text-align: center;
    margin-bottom: 3rem;
    color: var(--primary-color);
}

.about-content {
    max-width: 800px;
    margin: 0 auto;
}

.stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    margin-top: 3rem;
}

.stat-item {
    text-align: center;
}

.stat-item h3 {
    font-size: 2.5rem;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

/* Programs Section */
.programs {
    padding: 6rem 0;
}

.programs h2 {
    text-align: center;
    margin-bottom: 3rem;
    color: var(--primary-color);
}

.program-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.program-card {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.program-card:hover {
    transform: translateY(-5px);
}

.program-card h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.department-head {
    margin-top: 1rem;
    font-style: italic;
    color: #666;
}

.no-programs {
    grid-column: 1 / -1;
    text-align: center;
    padding: 2rem;
    background: var(--secondary-color);
    border-radius: 10px;
}

/* News Section */
.news {
    padding: 4rem 0;
    background-color: var(--secondary-color);
}

.news h2 {
    text-align: center;
    margin-bottom: 3rem;
    color: var(--primary-color);
}

.news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.news-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.news-card:hover {
    transform: translateY(-5px);
}

.news-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.news-content {
    padding: 1.5rem;
}

.news-content h3 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

.news-date {
    display: block;
    color: var(--secondary-color);
    font-size: 0.9rem;
    margin-top: 1rem;
}

.no-news {
    grid-column: 1 / -1;
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    color: var(--secondary-color);
}

/* Events Section */
.events {
    padding: 4rem 0;
}

.events h2 {
    text-align: center;
    margin-bottom: 3rem;
    color: var(--primary-color);
}

.events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.event-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.event-card:hover {
    transform: translateY(-5px);
}

.event-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.event-content {
    padding: 1.5rem;
}

.event-content h3 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

.event-details {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    font-size: 0.9rem;
    color: var(--secondary-color);
}

.no-events {
    grid-column: 1 / -1;
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    color: var(--secondary-color);
}

/* Facilities Section */
.facilities {
    padding: 4rem 0;
    background-color: var(--secondary-color);
}

.facilities h2 {
    text-align: center;
    margin-bottom: 3rem;
    color: var(--primary-color);
}

.facilities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.facility-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.facility-card:hover {
    transform: translateY(-5px);
}

.facility-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.facility-content {
    padding: 1.5rem;
}

.facility-content h3 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

.no-facilities {
    grid-column: 1 / -1;
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    color: var(--secondary-color);
}

/* Contact Section */
.contact {
    padding: 6rem 0;
    background-color: var(--secondary-color);
}

.contact h2 {
    text-align: center;
    margin-bottom: 3rem;
    color: var(--primary-color);
}

.contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
}

.contact-info {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.contact-details {
    margin: 2rem 0;
}

.contact-details p {
    margin-bottom: 1rem;
}

.address {
    margin-top: 2rem;
}

.contact-form {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-family: var(--font-family);
}

.form-group textarea {
    height: 150px;
    resize: vertical;
}

.submit-button {
    background-color: var(--primary-color);
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.3s ease;
}

.submit-button:hover {
    background-color: #0f2d5c;
}

/* Footer */
footer {
    background-color: var(--primary-color);
    color: white;
    padding: 4rem 0 2rem;
}

.footer-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 4rem;
    margin-bottom: 2rem;
}

.footer-info h3 {
    margin-bottom: 1rem;
}

.footer-links ul {
    list-style: none;
}

.footer-links ul li {
    margin-bottom: 0.5rem;
}

.footer-links ul li a {
    color: white;
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer-links ul li a:hover {
    color: var(--accent-color);
}

.footer-bottom {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid rgba(255,255,255,0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
    .mobile-menu-button {
        display: block;
    }

    nav ul {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: var(--primary-color);
        padding: 1rem;
        flex-direction: column;
        text-align: center;
    }

    nav ul.show {
        display: flex;
    }

    .hero h1 {
        font-size: 2.5rem;
    }

    .contact-grid {
        grid-template-columns: 1fr;
    }

    .footer-content {
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    .stats {
        grid-template-columns: 1fr;
    }
}

/* Departments Section */
.departments {
    padding: 4rem 0;
    background-color: var(--secondary-color);
}

.departments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.department-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.department-card:hover {
    transform: translateY(-5px);
}

.department-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.department-content {
    padding: 1.5rem;
}

.department-content h3 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

/* Faculty Section */
.faculty {
    padding: 4rem 0;
}

.faculty-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.faculty-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.faculty-card:hover {
    transform: translateY(-5px);
}

.faculty-card img {
    width: 100%;
    height: 300px;
    object-fit: cover;
}

.faculty-content {
    padding: 1.5rem;
}

.faculty-content h3 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

.faculty-content .position {
    color: var(--accent-color);
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.faculty-content .department {
    color: var(--secondary-color);
    margin-bottom: 1rem;
}

.faculty-content .bio {
    margin-bottom: 1rem;
}

.faculty-content .contact-info {
    font-size: 0.9rem;
    color: var(--secondary-color);
}

/* Courses Section */
.courses {
    padding: 4rem 0;
    background-color: var(--secondary-color);
}

.courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.course-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.course-card:hover {
    transform: translateY(-5px);
}

.course-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.course-content {
    padding: 1.5rem;
}

.course-content h3 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

.course-content .code {
    color: var(--accent-color);
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.course-content .description {
    margin-bottom: 1rem;
}

.course-content .course-details {
    font-size: 0.9rem;
    color: var(--secondary-color);
}

/* Research Section */
.research {
    padding: 4rem 0;
}

.research-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.research-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.research-card:hover {
    transform: translateY(-5px);
}

.research-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.research-content {
    padding: 1.5rem;
}

.research-content h3 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

.research-content .description {
    margin-bottom: 1rem;
}

.research-content .department {
    color: var(--accent-color);
    margin-bottom: 0.5rem;
}

.research-content .researchers,
.research-content .publications {
    font-size: 0.9rem;
    color: var(--secondary-color);
    margin-top: 0.5rem;
}

/* Virtual Tour Section */
.virtual-tour {
    padding: 4rem 0;
    background-color: var(--secondary-color);
}

.video-container {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    margin-bottom: 2rem;
}

.video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.tour-images {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
}

.tour-images img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
}

.tour-description {
    margin-top: 2rem;
}

/* Admissions Section */
.admissions {
    padding: 4rem 0;
}

.admissions-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.requirements,
.deadlines,
.application-process,
.admissions-contact {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.requirements h3,
.deadlines h3,
.application-process h3,
.admissions-contact h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.requirements ul,
.deadlines ul {
    list-style: none;
}

.requirements ul li,
.deadlines ul li {
    margin-bottom: 0.5rem;
    padding-left: 1.5rem;
    position: relative;
}

.requirements ul li:before,
.deadlines ul li:before {
    content: "•";
    position: absolute;
    left: 0;
    color: var(--accent-color);
}

.deadlines ul li {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.deadlines ul li strong {
    color: var(--primary-color);
}

.deadlines ul li span {
    color: var(--secondary-color);
    font-size: 0.9rem;
}

/* No Content Messages */
.no-departments,
.no-faculty,
.no-courses,
.no-research {
    grid-column: 1 / -1;
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    color: var(--secondary-color);
}
`;
}

// Helper function to generate website JavaScript
function generateWebsiteJS(college) {
    return `// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Mobile menu toggle
const mobileMenuButton = document.querySelector('.mobile-menu-button');
const navMenu = document.querySelector('nav ul');

mobileMenuButton.addEventListener('click', () => {
    navMenu.classList.toggle('show');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('nav')) {
        navMenu.classList.remove('show');
    }
});

// Form submission handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };

        try {
            // Here you would typically send the form data to your server
            console.log('Form submitted:', formData);
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error sending your message. Please try again.');
        }
    });
}

// Animate elements when they come into view
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.program-card, .stat-item');
    
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

    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(element);
    });
};

// Initialize animations when the page loads
document.addEventListener('DOMContentLoaded', animateOnScroll);

// Update copyright year
document.querySelector('.footer-bottom p').textContent = 
    document.querySelector('.footer-bottom p').textContent.replace(
        new Date().getFullYear(),
        new Date().getFullYear()
    );`;
}

// Helper function to generate README
function generateReadme(college) {
    return `# ${college.collegeName} Website

This is a complete website package for ${college.collegeName}. The package includes all necessary files to host the website.

## Files Included

- \`index.html\`: The main HTML file containing the website structure
- \`styles.css\`: CSS styles for the website
- \`script.js\`: JavaScript functionality for the website

## Setup Instructions

1. Upload all files to your web hosting server
2. Ensure all files are in the same directory
3. The website should work immediately after uploading

## Features

- Responsive design that works on all devices
- Modern and clean interface
- Contact form for visitor inquiries
- Smooth scrolling navigation
- Mobile-friendly menu
- Animated elements
- Custom color scheme

## Customization

You can customize the website by editing the following files:

- \`index.html\`: Update content and structure
- \`styles.css\`: Modify colors and styling
- \`script.js\`: Add or modify functionality

## Support

For any questions or support, please contact:
${college.contact?.email || 'support@example.com'}

## License

This website package is licensed for use by ${college.collegeName} only.
`;
}

module.exports = router; 