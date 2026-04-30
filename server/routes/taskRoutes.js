const express = require('express');
const { body  } = require('express-validator');
const router  = express.Router();
const ctrl    = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

const createVal = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title too long'),
  body('priority').optional().isIn(['high','medium','low']),
  body('status').optional().isIn(['todo','in_progress','done']),
];

router.get('/',              ctrl.getTasks);
router.get('/assigned',      ctrl.getAssignedTasks);
router.get('/:id',           ctrl.getTask);
router.post('/',   createVal, ctrl.createTask);
router.put('/:id',            ctrl.updateTask);
router.patch('/reorder',      ctrl.reorderTasks);
router.delete('/:id',         ctrl.deleteTask);
router.post('/:id/comments',  ctrl.addComment);

module.exports = router;