const express = require('express');
const router = express.Router();

const {
    obtenerEstudiantes
} = require('../controllers/estudiantesController');

router.get('/', obtenerEstudiantes);

module.exports = router;