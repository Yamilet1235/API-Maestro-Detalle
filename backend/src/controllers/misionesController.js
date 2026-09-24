const { getConnection } = require('../config/database');

async function obtenerMisiones(req, res) {
    try {
        const pool = await getConnection();

        const resultado = await pool
            .request()
            .query(`
                SELECT
                    MisionID,
                    Nombre,
                    Descripcion
                FROM Misiones
                ORDER BY MisionID
            `);

        res.status(200).json(resultado.recordset);

    } catch (error) {
        console.error('Error al obtener misiones:', error.message);

        res.status(500).json({
            mensaje: 'Error al consultar las misiones'
        });
    }
}

module.exports = {
    obtenerMisiones
};