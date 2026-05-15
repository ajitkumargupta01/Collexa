const express = require('express');
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getEventTickets } = require('../controllers/events');
const router = express.Router();

router.route('/').get(getEvents).post(createEvent);
router.route('/:id').get(getEvent).put(updateEvent).delete(deleteEvent);
router.route('/:id/tickets').get(getEventTickets);

module.exports = router;
