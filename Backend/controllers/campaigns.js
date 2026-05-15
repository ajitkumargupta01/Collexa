const Campaign = require('../models/Campaign');

// @desc    Create a fundraising campaign
exports.createCampaign = async (req, res) => {
    try {
        const { companyId, title, description, goalAmount, category, deadline, targetColleges, benefits } = req.body;
        const campaign = await Campaign.create({
            companyId,
            title,
            description,
            goalAmount,
            category,
            deadline,
            targetColleges: targetColleges || [],
            benefits
        });
        res.status(201).json({ success: true, data: campaign });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get campaigns for a company
exports.getCompanyCampaigns = async (req, res) => {
    try {
        const companyId = req.headers['user-id'];
        const campaigns = await Campaign.find({ companyId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: campaigns.length, data: campaigns });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all active campaigns (public)
exports.getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ status: 'active' })
            .populate('companyId', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: campaigns.length, data: campaigns });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update campaign (contribute or update status)
exports.updateCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });
        res.status(200).json({ success: true, data: campaign });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete / cancel a campaign
exports.deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
        if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });
        res.status(200).json({ success: true, data: campaign });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
