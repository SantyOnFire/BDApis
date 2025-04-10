const express = require('express');
const pool = require('./db'); // Importar el pool de conexiones

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// Ruta para probar la conexión
app.get('/api/prueba', async (req, res) => {
  try {
    const client = await pool.connect();
    res.send('API funcionando de manera correcta');
    client.release();
  } catch (err) {
    console.error('❌ Error al conectar con la base de datos:', err.message);
    res.status(500).send('Error al conectar con la base de datos');
  }
});

// Ruta para insertar datos en la tabla 'persona'
app.post('/api/guardar', async (req, res) => {
  const { cedula, nombre, edad, profesion } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO persona (cedula, nombre, edad, profesion) VALUES ($1, $2, $3, $4) RETURNING *',
      [cedula, nombre, edad, profesion]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error al insertar datos:', err.message);
    res.status(500).json({ message: 'Error creando el usuario', error: err.message });
  }
});

// Ruta para obtener datos de la tabla 'persona'
app.get('/api/obtener', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM persona');
    client.release();
    res.status(200).json({
      success: true,
      message: 'Datos de la tabla',
      data: result.rows
    });
  } catch (err) {
    console.error('❌ Error al obtener datos:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error al recuperar los datos',
      details: err.message
    });
  } 
});

// Ruta para eliminar una persona por cédula
app.delete('/api/eliminar/:cedula', async (req, res) => {
  const cedula = req.params.cedula.trim();
  const query = 'DELETE FROM persona WHERE TRIM(cedula) = $1';

  try {
    const result = await pool.query(query, [cedula]);

    if (result.rowCount > 0) {
      res.status(200).json({
        success: true,
        message: `Usuario con cédula ${cedula} eliminado correctamente`
      });
    } else {
      res.status(404).json({
        success: false,
        message: `No se encontró un usuario con cédula ${cedula}`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error eliminando el usuario',
      details: error.message
    });
  }
});

// Ruta para actualizar una persona por cédula
app.put('/api/actualizar/:cedula', async (req, res) => {
  const cedula = req.params.cedula.trim();
  const { nombre, edad, profesion } = req.body;

  const query = `
    UPDATE persona 
    SET nombre = $1, edad = $2, profesion = $3 
    WHERE cedula = $4
  `;

  try {
    const result = await pool.query(query, [nombre, edad, profesion, cedula]);

    if (result.rowCount > 0) {
      res.status(200).json({
        success: true,
        message: `Usuario con cédula ${cedula} actualizado correctamente`
      });
    } else {
      res.status(404).json({
        success: false,
        message: `No se encontró un usuario con cédula ${cedula}`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error actualizando el usuario',
      details: error.message
    });
  }
});
