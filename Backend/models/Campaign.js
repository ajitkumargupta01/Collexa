const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Campaign title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Campaign description is required']
    },
    goalAmount: {
        type: Number,
        required: [true, 'Fundraising goal is required'],
        min: 1
    },
    raisedAmount: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        enum: ['Education', 'Sports', 'Cultural', 'Tech', 'Social Cause', 'Infrastructure', 'Other'],
        default: 'Other'
    },
    deadline: {
        type: Date,
        required: [true, 'Campaign deadline is required']
    },
    targetColleges: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    benefits: {
        type: String // What sponsors get in return
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Campaign', CampaignSchema);
