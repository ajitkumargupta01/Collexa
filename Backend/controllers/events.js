const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('collegeId', 'name email collegeDetails')
            .sort({ date: 1 })
            .lean();
            
        for (let evt of events) {
            evt.ticketsCount = await Ticket.countDocuments({ eventId: evt._id, status: { $in: ['active', 'used'] } });
        }
        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('collegeId', 'name');
        if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
        res.status(200).json({ success: true, data: event });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (College only)
exports.createEvent = async (req, res) => {
    try {
        const event = await Event.create(req.body);
        res.status(201).json({ success: true, data: event });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (College only)
exports.updateEvent = async (req, res) => {
    try {
        const { title, description, date, location, ticketPrice, vipPrice, earlyBirdPrice, freePassColleges, allowedColleges, status } = req.body;
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { title, description, date, location, ticketPrice, vipPrice, earlyBirdPrice, freePassColleges, allowedColleges, status },
            { new: true, runValidators: true }
        ).populate('collegeId', 'name');
        if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
        res.status(200).json({ success: true, data: event });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete event (cascade: delete associated tickets)
// @route   DELETE /api/events/:id
// @access  Private (College only)
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
        // Cascade: remove all tickets for this event
        await Ticket.deleteMany({ eventId: req.params.id });
        await event.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all tickets for an event (attendance list for college)
// @route   GET /api/events/:id/tickets
// @access  Private (College only)
exports.getEventTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ eventId: req.params.id })
            .populate('studentId', 'name email studentDetails')
            .sort({ purchaseDate: -1 });
        res.status(200).json({ success: true, count: tickets.length, data: tickets });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
