const mongoose = require('mongoose');

const AdRequestSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.ObjectId, ref: 'Event', required: true },
    companyId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    collegeId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    adTitle: { type: String, trim: true },
    adType: { type: String, enum: ['Banner','Stage Backdrop','LED Screen','Social Media','Pamphlet','Stall','Merchandise','Other'], default: 'Banner' },
    budget: { type: Number, required: true },
    targetAudience: { type: String },
    bannerRequirements: { type: String, required: true },
    callToAction: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdRequest', AdRequestSchema);
