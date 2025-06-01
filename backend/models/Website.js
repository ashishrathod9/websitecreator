const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
  collegeName: {
    type: String,
    required: true,
  },
  features: {
    studentPortal: Boolean,
    facultyPortal: Boolean,
    attendanceSystem: Boolean,
    examManagement: Boolean,
    courseManagement: Boolean,
    libraryManagement: Boolean,
    feeManagement: Boolean,
    eventsCalendar: Boolean,
  },
  colorScheme: {
    type: String,
    default: '#1a365d',
  },
  additionalFeatures: String,
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending',
  },
  generatedCode: {
    type: String,
    default: '',
  },
  previewUrl: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('Website', websiteSchema); 