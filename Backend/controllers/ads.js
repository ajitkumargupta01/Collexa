const AdRequest = require('../models/AdRequest');

// @desc    Submit an ad request (Company)
exports.submitAdRequest = async (req, res) => {
    try {
        const { eventId, companyId, collegeId, budget, bannerRequirements, adTitle, adType, targetAudience, callToAction } = req.body;
        const ad = await AdRequest.create({
            eventId, companyId, collegeId, budget, bannerRequirements, adTitle, adType, targetAudience, callToAction
        });
        res.status(201).json({ success: true, data: ad });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get ad requests submitted by a company
exports.getCompanyAds = async (req, res) => {
    try {
        const companyId = req.headers['user-id'];
        const ads = await AdRequest.find({ companyId })
            .populate('eventId', 'title date location')
            .populate('collegeId', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: ads.length, data: ads });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get ad requests for a college
exports.getCollegeAds = async (req, res) => {
    try {
        const collegeId = req.headers['user-id'];
        const ads = await AdRequest.find({ collegeId })
            .populate('eventId')
            .populate('companyId', 'name email');
        res.status(200).json({ success: true, count: ads.length, data: ads });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update ad request — status (College Admin) OR fields (Company, pending only)
exports.updateAdStatus = async (req, res) => {
    try {
        const ad = await AdRequest.findById(req.params.id);
        if (!ad) return res.status(404).json({ success: false, error: 'AdRequest not found' });

        const { status, adTitle, adType, budget, targetAudience, bannerRequirements, callToAction } = req.body;

        if (status) {
            // College admin accepting/rejecting
            const updated = await AdRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
            return res.status(200).json({ success: true, data: updated });
        } else {
            // Company editing their own pending ad
            if (ad.status !== 'pending') {
                return res.status(400).json({ success: false, error: 'Only pending ad requests can be edited.' });
            }
            const editUpdate = {};
            if (adTitle !== undefined) editUpdate.adTitle = adTitle;
            if (adType !== undefined) editUpdate.adType = adType;
            if (budget !== undefined) editUpdate.budget = budget;
            if (targetAudience !== undefined) editUpdate.targetAudience = targetAudience;
            if (bannerRequirements !== undefined) editUpdate.bannerRequirements = bannerRequirements;
            if (callToAction !== undefined) editUpdate.callToAction = callToAction;
            const updated = await AdRequest.findByIdAndUpdate(req.params.id, editUpdate, { new: true });
            return res.status(200).json({ success: true, data: updated });
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
