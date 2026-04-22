const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/sales',     authenticate, requireRole('manager', 'admin'), ctrl.sales);
router.get('/products',  authenticate, requireRole('manager', 'admin'), ctrl.products);
router.get('/customers', authenticate, requireRole('manager', 'admin'), ctrl.customers);

router.get('/',       authenticate, requireRole('manager', 'admin'), ctrl.getAll);
router.get('/:id',    authenticate, requireRole('manager', 'admin'), ctrl.getOne);
router.post('/',      authenticate, requireRole('admin'), ctrl.create);
router.delete('/:id', authenticate, requireRole('admin'), ctrl.remove);

module.exports = router;
