const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/channelController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // all channel routes require auth

router.get('/',               ctrl.getChannels);
router.post('/',              ctrl.createChannel);
router.post('/dm',            ctrl.getOrCreateDM);
router.get('/:id',            ctrl.getChannel);
router.put('/:id',            ctrl.updateChannel);
router.post('/:id/members',   ctrl.addMember);
router.delete('/:id/members/:userId', ctrl.removeMember);

module.exports = router;