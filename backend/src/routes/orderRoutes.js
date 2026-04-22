const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/',                        authenticate, ctrl.getAll);
router.get('/:id',                     authenticate, ctrl.getOne);
router.post('/',                       authenticate, requireRole('customer'), ctrl.create);
router.patch('/:id/status',            authenticate, requireRole('admin'), ctrl.updateStatus);
router.delete('/:id',                  authenticate, requireRole('admin'), ctrl.remove);

// OrderItem sub-resource
router.post('/:id/items',              authenticate, requireRole('customer'), ctrl.addItem);
router.delete('/:id/items/:productId', authenticate, requireRole('customer'), ctrl.removeItem);

module.exports = router;
