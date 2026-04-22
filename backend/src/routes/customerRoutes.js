const router = require('express').Router();
const ctrl = require('../controllers/customerController');
const { authenticate, requireRole, requireSelfOrRole } = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);
router.get('/',          authenticate, requireRole('admin'), ctrl.getAll);
router.get('/:id',       authenticate, requireSelfOrRole('id', 'admin'), ctrl.getOne);
router.put('/:id',       authenticate, requireSelfOrRole('id', 'admin'), ctrl.update);
router.delete('/:id',    authenticate, requireRole('admin'), ctrl.remove);

module.exports = router;
