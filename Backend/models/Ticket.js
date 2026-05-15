const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const TicketSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        required: true
    },
    studentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // Unique code embedded in QR — validated exactly once
    ticketCode: {
        type: String,
        unique: true,
        default: () => uuidv4()
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'used'],
        default: 'active'
    },
    pricePaid: {
        type: Number,
        required: true
    },
    passType: {
        type: String,
        enum: ['general', 'vip', 'earlyBird'],
        default: 'general'
    },
    isFreePass: {
        type: Boolean,
        default: false
    },
    // QR validation tracking
    isUsed: {
        type: Boolean,
        default: false
    },
    scannedAt: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('Ticket', TicketSchema);
