const express = require('express');
const router = express.Router();

const {
    registrar
} = require('../controllers/registroController');

router.post('/', registrar);

module.exports = router;