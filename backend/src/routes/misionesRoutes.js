const express = require('express');
const router = express.Router();

const {
    obtenerMisiones
} = require('../controllers/misionesController');

router.get('/', obtenerMisiones);

module.exports = router;