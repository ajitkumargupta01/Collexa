const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

// @desc    Get user's tickets (with event + college populated)
// @route   GET /api/tickets/my
// @access  Private
exports.getMyTickets = async (req, res) => {
    try {
        const studentId = req.headers['user-id'];
        if (!studentId) return res.status(401).json({ success: false, error: 'Not authorized' });

        const tickets = await Ticket.find({ studentId })
            .populate({
                path: 'eventId',
                populate: { path: 'collegeId', select: 'name' }
            })
            .populate('studentId', 'name email studentDetails')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: tickets.length, data: tickets });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Buy ticket for event (with free-pass logic)
// @route   POST /api/tickets
// @access  Private
exports.buyTicket = async (req, res) => {
    try {
        const { eventId, studentId, pricePaid, passType } = req.body;

        // Ensure event exists
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ success: false, error: 'Event not found' });

        // Prevent duplicate ticket purchase for same event
        const existing = await Ticket.findOne({ eventId, studentId, status: { $in: ['active', 'used'] } });
        if (existing) return res.status(400).json({ success: false, error: 'You already have a ticket for this event.' });

        // Determine if student gets a free pass
        const user = await require('../models/User').findById(studentId).select('studentDetails');
        const studentCollege = user?.studentDetails?.collegeName || '';

        if (event.allowedColleges && event.allowedColleges.length > 0) {
            const isAllowed = event.allowedColleges.some(
                (c) => c.toLowerCase() === studentCollege.toLowerCase()
            );
            if (!isAllowed) {
                return res.status(403).json({ 
                    success: false, 
                    error: `Only students from ${event.allowedColleges.join(', ')} can register.` 
                });
            }
        }

        const isFreePass = event.freePassColleges && event.freePassColleges.some(
            (c) => c.toLowerCase() === studentCollege.toLowerCase()
        );
        const finalPrice = isFreePass ? 0 : (Number(pricePaid) || 0);

        const createdTicket = await Ticket.create({
            eventId,
            studentId,
            pricePaid: finalPrice,
            isFreePass,
            passType: passType || 'general',
        });

        const ticket = await Ticket.findById(createdTicket._id)
            .populate({ path: 'eventId', populate: { path: 'collegeId', select: 'name' } })
            .populate('studentId', 'name email studentDetails');

        res.status(201).json({ success: true, data: ticket, isFreePass });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all tickets for a specific event (college attendance view)
// @route   GET /api/tickets/event/:eventId
// @access  Private (College)
exports.getEventTickets = async (req, res) => {
    try {
        const { eventId } = req.params;
        const tickets = await Ticket.find({ eventId })
            .populate('studentId', 'name email studentDetails')
            .populate('eventId', 'title date location')
            .sort({ purchaseDate: -1 });
        res.status(200).json({ success: true, count: tickets.length, data: tickets });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Validate a ticket QR code — one-time use only
// @route   POST /api/tickets/validate
// @access  Public (scanner)
exports.validateTicket = async (req, res) => {
    try {
        const { ticketCode } = req.body;
        const scanningCollegeId = req.headers['user-id']; // Optional: check if scanning for right college

        if (!ticketCode) return res.status(400).json({ success: false, valid: false, error: 'No ticket code provided.' });

        const ticket = await Ticket.findOne({ ticketCode })
            .populate('eventId')
            .populate('studentId', 'name email studentDetails');

        if (!ticket) return res.status(404).json({ success: false, valid: false, error: 'Invalid ticket — not found in system.' });

        const event = ticket.eventId;
        if (!event) return res.status(404).json({ success: false, valid: false, error: 'Event associated with this ticket no longer exists.' });

        // Authorization check: Ensure this ticket is for an event owned by the scanning college (if ID provided)
        if (scanningCollegeId && String(event.collegeId) !== String(scanningCollegeId)) {
            // Note: event.collegeId might be an ID or object depending on population in other routes, 
            // but here Ticket model stores eventId as ObjectId, and we populated 'eventId'.
            // In Event model, collegeId is also ObjectId.
        }

        // 1. Check if event is cancelled or completed
        if (event.status === 'cancelled') {
            return res.status(200).json({
                success: true,
                valid: false,
                message: '❌ This event has been cancelled.',
                ticket: { studentName: ticket.studentId?.name, eventTitle: event.title }
            });
        }
        
        if (event.status === 'completed') {
            return res.status(200).json({
                success: true,
                valid: false,
                message: '🏁 This event has already concluded.',
                ticket: { studentName: ticket.studentId?.name, eventTitle: event.title }
            });
        }

        // 2. Check if event date has passed (only if not 'ongoing')
        if (event.status !== 'ongoing') {
            const eventDate = new Date(event.date);
            const today = new Date();
            // Allow scanning on the day of the event
            const isToday = eventDate.toDateString() === today.toDateString();
            
            if (eventDate < today && !isToday) {
                const diffMs = today - eventDate;
                if (diffMs > 86400000) { // more than 24h ago
                    return res.status(200).json({
                        success: true,
                        valid: false,
                        message: '⏰ Ticket expired — event was on ' + eventDate.toDateString(),
                        ticket: {
                            studentName: ticket.studentId?.name,
                            eventTitle: event.title,
                            eventDate: event.date,
                        }
                    });
                }
            }
        }

        // 3. Check if already used
        if (ticket.isUsed) {
            return res.status(200).json({
                success: true,
                valid: false,
                message: '❌ Ticket already used! Scanned on ' + new Date(ticket.scannedAt).toLocaleString(),
                ticket: {
                    studentName: ticket.studentId?.name,
                    eventTitle: event.title,
                    scannedAt: ticket.scannedAt,
                }
            });
        }

        // 4. Check if ticket itself is cancelled
        if (ticket.status === 'cancelled') {
            return res.status(200).json({
                success: true,
                valid: false,
                message: '❌ This ticket has been revoked/cancelled.',
                ticket: { studentName: ticket.studentId?.name, eventTitle: event.title }
            });
        }

        // SUCCESS: Mark as used
        ticket.isUsed = true;
        ticket.scannedAt = new Date();
        ticket.status = 'used';
        await ticket.save();

        res.status(200).json({
            success: true,
            valid: true,
            message: '✅ Ticket validated successfully! Welcome!',
            ticket: {
                studentName: ticket.studentId?.name,
                studentCollege: ticket.studentId?.studentDetails?.collegeName || '—',
                eventTitle: event.title,
                pricePaid: ticket.pricePaid,
                isFreePass: ticket.isFreePass,
                passType: ticket.passType,
                scannedAt: ticket.scannedAt,
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, valid: false, error: err.message });
    }
};
