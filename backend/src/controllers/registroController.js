const { sql, getConnection } = require('../config/database');

async function registrar(req, res) {
    const { maestro, detalle } = req.body;

    // Validación básica del maestro
    if (
        !maestro ||
        !maestro.carnet ||
        !maestro.nombre ||
        !maestro.correo
    ) {
        return res.status(400).json({
            mensaje: 'Debe enviar carnet, nombre y correo'
        });
    }

    // Validación del detalle
    if (!Array.isArray(detalle) || detalle.length === 0) {
        return res.status(400).json({
            mensaje: 'Debe enviar al menos una misión en detalle'
        });
    }

    for (const item of detalle) {
        if (
            !Number.isInteger(item.misionId) ||
            typeof item.estado !== 'boolean'
        ) {
            return res.status(400).json({
                mensaje:
                    'Cada detalle debe contener misionId entero y estado true/false'
            });
        }
    }

    let transaction;

    try {
        const pool = await getConnection();

        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // ---------------------------------
        // 1. Buscar si existe el estudiante
        // ---------------------------------

        const buscarEstudiante = await new sql.Request(transaction)
            .input(
                'carnet',
                sql.VarChar(25),
                maestro.carnet
            )
            .query(`
                SELECT Carnet
                FROM Estudiantes
                WHERE Carnet = @carnet
            `);

        const estudianteExiste =
            buscarEstudiante.recordset.length > 0;

        if (!estudianteExiste) {

            // INSERT maestro
            await new sql.Request(transaction)
                .input(
                    'carnet',
                    sql.VarChar(25),
                    maestro.carnet
                )
                .input(
                    'nombre',
                    sql.NVarChar(150),
                    maestro.nombre
                )
                .input(
                    'correo',
                    sql.NVarChar(150),
                    maestro.correo
                )
                .query(`
                    INSERT INTO Estudiantes
                        (Carnet, Nombre, Correo)
                    VALUES
                        (@carnet, @nombre, @correo)
                `);

        } else {

            // UPDATE maestro
            await new sql.Request(transaction)
                .input(
                    'carnet',
                    sql.VarChar(25),
                    maestro.carnet
                )
                .input(
                    'nombre',
                    sql.NVarChar(150),
                    maestro.nombre
                )
                .input(
                    'correo',
                    sql.NVarChar(150),
                    maestro.correo
                )
                .query(`
                    UPDATE Estudiantes
                    SET
                        Nombre = @nombre,
                        Correo = @correo
                    WHERE Carnet = @carnet
                `);
        }

        // ---------------------------------
        // 2. Procesar cada misión
        // ---------------------------------

        for (const item of detalle) {

            // ¿Existe la misión?
            const misionExiste = await new sql.Request(transaction)
                .input(
                    'misionId',
                    sql.Int,
                    item.misionId
                )
                .query(`
                    SELECT MisionID
                    FROM Misiones
                    WHERE MisionID = @misionId
                `);

            if (misionExiste.recordset.length === 0) {
                const error = new Error(
                    `La misión ${item.misionId} no existe en el catálogo`
                );

                error.statusCode = 400;
                throw error;
            }

            // ¿El estudiante ya tiene esa misión?
            const detalleExiste = await new sql.Request(transaction)
                .input(
                    'carnet',
                    sql.VarChar(25),
                    maestro.carnet
                )
                .input(
                    'misionId',
                    sql.Int,
                    item.misionId
                )
                .query(`
                    SELECT DetalleID
                    FROM EstudianteMisiones
                    WHERE Carnet = @carnet
                      AND MisionID = @misionId
                `);

            if (detalleExiste.recordset.length === 0) {

                // INSERT detalle
                await new sql.Request(transaction)
                    .input(
                        'carnet',
                        sql.VarChar(25),
                        maestro.carnet
                    )
                    .input(
                        'misionId',
                        sql.Int,
                        item.misionId
                    )
                    .input(
                        'estado',
                        sql.Bit,
                        item.estado
                    )
                    .query(`
                        INSERT INTO EstudianteMisiones
                            (Carnet, MisionID, Estado)
                        VALUES
                            (@carnet, @misionId, @estado)
                    `);

            } else {

                // UPDATE detalle
                await new sql.Request(transaction)
                    .input(
                        'carnet',
                        sql.VarChar(25),
                        maestro.carnet
                    )
                    .input(
                        'misionId',
                        sql.Int,
                        item.misionId
                    )
                    .input(
                        'estado',
                        sql.Bit,
                        item.estado
                    )
                    .query(`
                        UPDATE EstudianteMisiones
                        SET Estado = @estado
                        WHERE Carnet = @carnet
                          AND MisionID = @misionId
                    `);
            }
        }

        // Todo salió bien
        await transaction.commit();

        return res
            .status(estudianteExiste ? 200 : 201)
            .json({
                mensaje: 'Registro procesado correctamente',
                carnet: maestro.carnet,
                estudianteNuevo: !estudianteExiste,
                misionesProcesadas: detalle.length
            });

    } catch (error) {

        if (transaction) {
            try {
                await transaction.rollback();
            } catch (_) {}
        }

        console.error(
            'Error al procesar registro:',
            error.message
        );

        if (
            error.number === 2601 ||
            error.number === 2627
        ) {
            return res.status(409).json({
                mensaje:
                    'Existe un dato duplicado, por ejemplo correo o misión'
            });
        }

        return res
            .status(error.statusCode || 500)
            .json({
                mensaje:
                    error.message ||
                    'Error al procesar el registro'
            });
    }
}

module.exports = {
    registrar
};