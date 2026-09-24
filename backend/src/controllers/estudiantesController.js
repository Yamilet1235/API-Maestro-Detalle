const { getConnection } = require('../config/database');

async function obtenerEstudiantes(req, res) {
    try {
        const pool = await getConnection();

        const resultado = await pool.request().query(`
            SELECT
                e.Carnet,
                e.Nombre AS EstudianteNombre,
                e.Correo,
                m.MisionID,
                m.Nombre AS MisionNombre,
                ISNULL(em.Estado, 0) AS Estado
            FROM Estudiantes e
            CROSS JOIN Misiones m
            LEFT JOIN EstudianteMisiones em
                ON em.Carnet = e.Carnet
                AND em.MisionID = m.MisionID
            ORDER BY e.Carnet, m.MisionID
        `);

        const estudiantes = [];

        for (const fila of resultado.recordset) {

            let estudiante = estudiantes.find(
                e => e.carnet === fila.Carnet
            );

            if (!estudiante) {
                estudiante = {
                    carnet: fila.Carnet,
                    nombre: fila.EstudianteNombre,
                    correo: fila.Correo,
                    misiones: []
                };

                estudiantes.push(estudiante);
            }

            estudiante.misiones.push({
                misionId: fila.MisionID,
                nombre: fila.MisionNombre,
                estado: Boolean(fila.Estado)
            });
        }

        res.status(200).json(estudiantes);

    } catch (error) {
        console.error(
            'Error al obtener estudiantes:',
            error.message
        );

        res.status(500).json({
            mensaje: 'Error al consultar estudiantes',
            error: error.message
        });
    }
}

module.exports = {
    obtenerEstudiantes
};