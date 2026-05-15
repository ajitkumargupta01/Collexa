const express = require('express');
const { submitQuotation, getCollegeQuotations, getOrganizerQuotations, updateQuotationStatus, deleteQuotation } = require('../controllers/quotations');
const router = express.Router();

router.route('/').post(submitQuotation);
router.route('/college').get(getCollegeQuotations);
router.route('/organizer').get(getOrganizerQuotations);
router.route('/:id').put(updateQuotationStatus).delete(deleteQuotation);

module.exports = router;
