const { Router } = require('express');
const { startLevel, endLevel } = require('../controllers/stats');
const router = Router();

router.post('/start-level', startLevel);
router.patch('/end-level/:statsId', endLevel);

module.exports = router;
