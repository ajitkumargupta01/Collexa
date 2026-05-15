const express = require('express');
const { createCampaign, getCompanyCampaigns, getAllCampaigns, updateCampaign, deleteCampaign } = require('../controllers/campaigns');
const router = express.Router();

router.route('/').post(createCampaign).get(getAllCampaigns);
router.route('/company').get(getCompanyCampaigns);
router.route('/:id').put(updateCampaign).delete(deleteCampaign);

module.exports = router;
