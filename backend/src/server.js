const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { getConnection } = require('./config/database');
const misionesRoutes = require('./routes/misionesRoutes');
const estudiantesRoutes = require('./routes/estudiantesRoutes');  
const registroRoutes = require('./routes/registroRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/misiones', misionesRoutes);
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/registro', registroRoutes);

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API Maestro-Detalle funcionando'
    });
});

app.get('/api/prueba-db', async (req, res) => {
    try {
        const pool = await getConnection();

        const resultado = await pool
            .request()
            .query('SELECT TOP 5 * FROM Misiones');

        res.json(resultado.recordset);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: 'Error al consultar la base de datos',
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});