const API_URL =
    'https://api-maestro-detalle-yamilet.onrender.com/api/estudiantes';

async function cargarEstudiantes() {

    try {

        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error('No fue posible consultar la API');
        }

        const estudiantes = await respuesta.json();

        mostrarEstudiantes(estudiantes);
        mostrarEstadisticas(estudiantes);

    } catch (error) {

        console.error('Error:', error);

        document.getElementById('tablaEstudiantes').innerHTML = `
            <tr>
                <td colspan="6">
                    Error al cargar los estudiantes
                </td>
            </tr>
        `;
    }
}

function mostrarEstudiantes(estudiantes) {

    const tabla = document.getElementById('tablaEstudiantes');

    tabla.innerHTML = '';

    estudiantes.forEach(estudiante => {

        const totalMisiones = estudiante.misiones.length;

        const completadas = estudiante.misiones.filter(
            mision => mision.estado === true
        ).length;

        const porcentaje =
            totalMisiones === 0
                ? 0
                : Math.round(
                    (completadas / totalMisiones) * 100
                );

        const estado =
            porcentaje === 100
                ? '<span class="completo">✔ Completado</span>'
                : '<span class="pendiente">Pendiente</span>';

        const fila = `
            <tr>

                <td>${estudiante.carnet}</td>

                <td>${estudiante.nombre}</td>

                <td>${estudiante.correo}</td>

                <td>
                    ${completadas} / ${totalMisiones}
                </td>

                <td>

                    <div class="barra">

                        <div
                            class="progreso"
                            style="width:${porcentaje}%"
                        >
                            ${porcentaje}%
                        </div>

                    </div>

                </td>

                <td>${estado}</td>

            </tr>
        `;

        tabla.innerHTML += fila;
    });
}

function mostrarEstadisticas(estudiantes) {

    const total = estudiantes.length;

    let sumaPorcentajes = 0;
    let alumnosCompletos = 0;

    estudiantes.forEach(estudiante => {

        const totalMisiones = estudiante.misiones.length;

        const completadas = estudiante.misiones.filter(
            mision => mision.estado === true
        ).length;

        const porcentaje =
            totalMisiones === 0
                ? 0
                : (completadas / totalMisiones) * 100;

        sumaPorcentajes += porcentaje;

        if (porcentaje === 100) {
            alumnosCompletos++;
        }
    });

    const promedio =
        total === 0
            ? 0
            : Math.round(sumaPorcentajes / total);

    document.getElementById('totalEstudiantes').textContent =
        total;

    document.getElementById('promedio').textContent =
        `${promedio}%`;

    document.getElementById('completados').textContent =
        alumnosCompletos;
}

cargarEstudiantes();