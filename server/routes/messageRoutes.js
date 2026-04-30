const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/search',         ctrl.searchMessages);
router.get('/:channelId',     ctrl.getMessages);
router.put('/:id',            ctrl.editMessage);
router.delete('/:id',         ctrl.deleteMessage);
router.post('/:id/react',     ctrl.reactToMessage);
router.post('/:id/read',      ctrl.markRead);

module.exports = router;