const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
    collegeName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true }
    },
    establishedYear: {
        type: Number,
        required: true
    },
    contact: {
        email: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        website: {
            type: String,
            required: true,
            trim: true
        }
    },
    departments: [{
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        head: { type: String, trim: true },
        image: { type: String }
    }],
    facilities: [{
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        image: { type: String }
    }],
    news: [{
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true, trim: true },
        date: { type: Date, required: true },
        image: { type: String }
    }],
    events: [{
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        date: { type: Date, required: true },
        location: { type: String, trim: true },
        image: { type: String }
    }],
    faculty: [{
        name: { type: String, required: true, trim: true },
        position: { type: String, required: true, trim: true },
        department: { type: String, required: true, trim: true },
        bio: { type: String, trim: true },
        image: { type: String },
        email: { type: String, trim: true },
        phone: { type: String, trim: true }
    }],
    courses: [{
        name: { type: String, required: true, trim: true },
        code: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        credits: { type: String, trim: true },
        duration: { type: String, trim: true },
        prerequisites: { type: String, trim: true },
        department: { type: String, required: true, trim: true },
        image: { type: String }
    }],
    research: [{
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        department: { type: String, required: true, trim: true },
        researchers: { type: String, trim: true },
        publications: { type: String, trim: true },
        image: { type: String }
    }],
    virtualTour: {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        videoUrl: { type: String, trim: true },
        images: [{ type: String }]
    },
    admissions: {
        requirements: [{ type: String, trim: true }],
        deadlines: [{
            title: { type: String, required: true, trim: true },
            date: { type: Date, required: true }
        }],
        applicationProcess: { type: String, trim: true },
        contactInfo: { type: String, trim: true }
    },
    template: {
        id: { type: Number },
        name: { type: String },
        description: { type: String },
        features: [{ type: String }],
        previewImage: { type: String },
        defaultColors: {
            primary: { type: String },
            secondary: { type: String },
            background: { type: String },
            text: { type: String },
            accent: { type: String }
        }
    },
    colors: {
        primary: { type: String },
        secondary: { type: String },
        background: { type: String },
        text: { type: String },
        accent: { type: String }
    },
    images: {
        hero: { type: String },
        campus: { type: String },
        departments: { type: Map, of: String },
        facilities: { type: Map, of: String },
        news: { type: Map, of: String },
        events: { type: Map, of: String },
        faculty: { type: Map, of: String },
        courses: { type: Map, of: String },
        research: { type: Map, of: String },
        virtualTour: { type: Map, of: String }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

// Add text index for search functionality
collegeSchema.index({ 
    collegeName: 'text', 
    description: 'text',
    'departments.name': 'text',
    'faculty.name': 'text',
    'courses.name': 'text'
});

// Update the updatedAt timestamp before saving
collegeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const College = mongoose.model('College', collegeSchema);

module.exports = College; 