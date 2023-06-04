const express = require('express');
const mongoose = require('mongoose');

// Conectar a la base de datos de MongoDB
mongoose.connect('"mongodb+srv://maxwinicki:perr01234@cluster1.njkoqwj.mongodb.net/?retryWrites=true&w=majority"', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definir el esquema del documento de la base de datos
const ticketSchema = new mongoose.Schema({
  name: String,
  eventDate: String,
  location: String,
  budget: Number,
  email: String,
});

// Crear un modelo basado en el esquema
const Ticket = mongoose.model('Ticket', ticketSchema);

// Crear una instancia de la aplicación Express
const app = express();

// Permitir el análisis de JSON en las solicitudes
app.use(express.json());

// Ruta para guardar los datos del formulario
app.post('/api/tickets', async (req, res) => {
  try {
    // Crear una nueva instancia del modelo Ticket con los datos recibidos
    const ticket = new Ticket(req.body);
    // Guardar el ticket en la base de datos
    await ticket.save();
    // Enviar una respuesta de éxito
    res.status(201).json({ message: 'Ticket guardado correctamente' });
  } catch (error) {
    // En caso de error, enviar una respuesta de error
    res.status(500).json({ error: 'Error al guardar el ticket' });
  }
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});
