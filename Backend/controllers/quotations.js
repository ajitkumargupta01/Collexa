const Quotation = require('../models/Quotation');

// @desc    Submit a quotation (Organizer/Vendor)
// @route   POST /api/quotations
exports.submitQuotation = async (req, res) => {
    try {
        const {
            eventId, organizerId, collegeId,
            serviceType, proposedPrice, serviceCharges,
            planningDetails, message, vendorContact
        } = req.body;

        // Prevent duplicate quotation for same event + organizer + service
        const existing = await Quotation.findOne({ eventId, organizerId, serviceType });
        if (existing) {
            return res.status(400).json({ success: false, error: 'You already submitted a quotation for this service on this event.' });
        }

        const quote = await Quotation.create({
            eventId, organizerId, collegeId,
            serviceType, proposedPrice,
            serviceCharges: serviceCharges || [],
            planningDetails: planningDetails || '',
            message,
            vendorContact
        });

        res.status(201).json({ success: true, data: quote });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get quotations for a specific college's events
// @route   GET /api/quotations/college
exports.getCollegeQuotations = async (req, res) => {
    try {
        const collegeId = req.headers['user-id'];
        const quotes = await Quotation.find({ collegeId })
            .populate('eventId', 'title date location')
            .populate('organizerId', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: quotes.length, data: quotes });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get quotations submitted BY an organizer
// @route   GET /api/quotations/organizer
exports.getOrganizerQuotations = async (req, res) => {
    try {
        const organizerId = req.headers['user-id'];
        const quotes = await Quotation.find({ organizerId })
            .populate('eventId', 'title date location')
            .populate('collegeId', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: quotes.length, data: quotes });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update quotation — status (College Admin) OR fields (Organizer, pending only)
// @route   PUT /api/quotations/:id
exports.updateQuotationStatus = async (req, res) => {
    try {
        const quote = await Quotation.findById(req.params.id);
        if (!quote) return res.status(404).json({ success: false, error: 'Quotation not found' });

        // Determine what we are updating
        const { status, note, proposedPrice, serviceType, serviceCharges, planningDetails, message } = req.body;

        if (status) {
            // College admin updating status
            const update = { status };
            if (note !== undefined) update.note = note;
            const updated = await Quotation.findByIdAndUpdate(req.params.id, update, { new: true });
            return res.status(200).json({ success: true, data: updated });
        } else {
            // Organizer editing their own pending quotation
            if (quote.status !== 'pending') {
                return res.status(400).json({ success: false, error: 'Only pending quotations can be edited.' });
            }
            const editUpdate = {};
            if (proposedPrice !== undefined) editUpdate.proposedPrice = proposedPrice;
            if (serviceType !== undefined) editUpdate.serviceType = serviceType;
            if (serviceCharges !== undefined) editUpdate.serviceCharges = serviceCharges;
            if (planningDetails !== undefined) editUpdate.planningDetails = planningDetails;
            if (message !== undefined) editUpdate.message = message;
            const updated = await Quotation.findByIdAndUpdate(req.params.id, editUpdate, { new: true });
            return res.status(200).json({ success: true, data: updated });
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Withdraw (delete) a pending quotation — Organizer only
// @route   DELETE /api/quotations/:id
exports.deleteQuotation = async (req, res) => {
    try {
        const organizerId = req.headers['user-id'];
        const quote = await Quotation.findById(req.params.id);
        if (!quote) return res.status(404).json({ success: false, error: 'Quotation not found' });
        if (String(quote.organizerId) !== String(organizerId)) {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this quotation' });
        }
        if (quote.status !== 'pending') {
            return res.status(400).json({ success: false, error: 'Only pending quotations can be withdrawn.' });
        }
        await quote.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
