const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/meetingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/',                  ctrl.createRoom);
router.get('/history',            ctrl.getHistory);
router.get('/:roomId',            ctrl.getMeeting);
router.post('/:roomId/end',       ctrl.endMeeting);
router.post('/summarize',         ctrl.summarize);

module.exports = router;