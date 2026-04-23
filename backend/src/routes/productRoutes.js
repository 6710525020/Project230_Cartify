const router = require('express').Router();
const ctrl = require('../controllers/productController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/',       ctrl.getAll);
router.get('/categories', ctrl.getCategories);
router.get('/:id',    ctrl.getOne);
router.post('/',      authenticate, requireRole('admin', 'manager'), ctrl.create);
router.put('/:id',    authenticate, requireRole('admin', 'manager'), ctrl.update);
router.delete('/:id', authenticate, requireRole('admin', 'manager'), ctrl.remove);

module.exports = router;
