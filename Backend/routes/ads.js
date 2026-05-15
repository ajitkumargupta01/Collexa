const express = require('express');
const { submitAdRequest, getCompanyAds, getCollegeAds, updateAdStatus } = require('../controllers/ads');
const router = express.Router();

router.route('/').post(submitAdRequest);
router.route('/company').get(getCompanyAds);
router.route('/college').get(getCollegeAds);
router.route('/:id').put(updateAdStatus);

module.exports = router;
