const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/suggest-priority', ctrl.suggestPriority);
router.post('/summarize-chat',   ctrl.summarizeChat);

module.exports = router;