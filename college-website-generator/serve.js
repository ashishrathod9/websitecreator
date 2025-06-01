const express = require('express');
const path = require('path');
const app = express();

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Frontend server is running' });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'build', 'index.html');
  console.log('Serving index.html from:', indexPath);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading the application');
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Frontend server is running on port ${port}`);
  console.log('Build directory:', path.join(__dirname, 'build'));
}); 