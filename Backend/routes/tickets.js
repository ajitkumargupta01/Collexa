const express = require('express');
const { getMyTickets, buyTicket, validateTicket, getEventTickets } = require('../controllers/tickets');
const router = express.Router();

router.route('/').post(buyTicket);
router.route('/my').get(getMyTickets);
router.route('/validate').post(validateTicket);
router.route('/event/:eventId').get(getEventTickets);

module.exports = router;
