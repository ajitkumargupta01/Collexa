const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title can not be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [1000, 'Description can not be more than 1000 characters']
    },
    date: {
        type: Date,
        required: [true, 'Please add an event date']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    ticketPrice: {
        type: Number,
        default: 0
    },
    vipPrice: {
        type: Number,
        default: 0
    },
    earlyBirdPrice: {
        type: Number,
        default: 0
    },
    freePassColleges: {
        type: [String],
        default: []
    },
    // If populated, only students from these colleges can register
    // Empty array = open to all colleges
    allowedColleges: {
        type: [String],
        default: []
    },
    collegeId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    bannerUrl: {
        type: String, // Simulate banner image url
        default: 'no-photo.jpg'
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', EventSchema);
