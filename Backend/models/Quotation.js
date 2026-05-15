const mongoose = require('mongoose');

const ServiceChargeSchema = new mongoose.Schema({
    item: { type: String, required: true },         // e.g. "DJ Equipment Setup"
    cost: { type: Number, required: true }           // e.g. 5000
}, { _id: false });

const QuotationSchema = new mongoose.Schema({
    // === Event & Parties ===
    eventId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        required: true
    },
    organizerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    collegeId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    // === Service Details ===
    serviceType: {
        type: String,
        required: true,
        enum: ['DJ & Sound', 'Lighting', 'Decoration', 'Photography/Videography', 'Catering', 'Security', 'Stage Setup', 'Transportation', 'Other'],
        default: 'Other'
    },
    proposedPrice: {
        type: Number,
        required: true
    },
    serviceCharges: [ServiceChargeSchema],          // Itemized breakdown
    planningDetails: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        required: true
    },

    // === Vendor Contact Details ===
    vendorContact: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        companyName: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, default: '' },
        website: { type: String, default: '' },
        gstNumber: { type: String, default: '' },   // Optional GST/Tax ID
        experience: { type: String, default: '' },  // e.g. "5 years in corporate events"
    },

    // === Status ===
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    // Optional note from college admin
    note: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Quotation', QuotationSchema);
