 import React, { useState } from 'react';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const App = () => {
  const [events, setEvents] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');

  const handleEventCreate = (eventName) => {
    setEvents((prevEvents) => ({
      ...prevEvents,
      [eventName]: [],
    }));
  };

  const handleSaveUser = (eventName, name, eventDate, location, budget, email) => {
    const newUser = {
      id: users.length + 1,
      name,
      eventDate,
      location,
      budget,
      email,
      received: false,
    };

    setEvents((prevEvents) => ({
      ...prevEvents,
      [eventName]: [...prevEvents[eventName], newUser],
    }));

    setUsers([...users, newUser]);
  };

  const generatePDF = async (user) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([200, 100]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText(`bridenformal`, { x: 5, y: 80, size: 15, font });
    page.drawText(`Nombre: ${user.name}`, { x: 5, y: 70, size: 8, font });
    page.drawText(`#Cliente: ${user.id}`, { x: 5, y: 60, size: 8, font });
    page.drawText(`Fecha del evento: ${user.eventDate}`, { x: 5, y: 50, size: 8, font });
    page.drawText(`Lugar: ${user.location}`, { x: 5, y: 40, size: 8, font });
    page.drawText(`Presupuesto: ${user.budget}`, { x: 5, y: 30, size: 8, font });
    page.drawText(`Email: ${user.email}`, { x: 5, y: 20, size: 8, font });

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;

    document.body.appendChild(iframe);

    iframe.contentWindow.print();

    setUsers((prevUsers) =>
      prevUsers.map((prevUser) =>
        prevUser.id === user.id ? { ...prevUser, received: true } : prevUser
      )
    );
  };

  const handleEventChange = (e) => {
    setSelectedEvent(e.target.value);
  };

  const filteredUsers = selectedEvent ? events[selectedEvent] : users;

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/eventos">Eventos</Link>
            </li>
            <li>
              <Link to="/usuarios">Usuarios Guardados</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home handleEventCreate={handleEventCreate} />} />
          <Route
            path="/eventos"
            element={<Eventos events={events} handleSaveUser={handleSaveUser} />}
          />
          <Route
            path="/usuarios"
            element={
              <UsuariosGuardados
                users={filteredUsers}
                generatePDF={generatePDF}
                events={events}
                selectedEvent={selectedEvent}
                handleEventChange={handleEventChange}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

const Home = ({ handleEventCreate }) => {
  const [eventName, setEventName] = useState('');

  const handleEventNameChange = (e) => {
    setEventName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleEventCreate(eventName);
    setEventName('');
  };

  return (
    <div>
      <h1>Inicio</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre del Evento:
          <input type="text" value={eventName} onChange={handleEventNameChange} />
        </label>
        <br />
        <button type="submit">Crear Evento</button>
      </form>
    </div>
  );
};

const Eventos = ({ events, handleSaveUser }) => {
  const [eventName, setEventName] = useState('');
  const [name, setName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [email, setEmail] = useState('');

  const handleEventNameChange = (e) => {
    setEventName(e.target.value);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEventDateChange = (e) => {
    setEventDate(e.target.value);
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handleBudgetChange = (e) => {
    setBudget(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveUser(eventName, name, eventDate, location, budget, email);
    setName('');
    setEventDate('');
    setLocation('');
    setBudget('');
    setEmail('');
  };

  return (
    <div>
      <h1>Eventos</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Evento:
          <select value={eventName} onChange={handleEventNameChange}>
            <option value="">Seleccionar Evento</option>
            {Object.keys(events).map((event) => (
              <option key={event} value={event}>
                {event}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Nombre:
          <input type="text" value={name} onChange={handleNameChange} />
        </label>
        <br />
        <label>
          Fecha del evento:
          <input type="date" value={eventDate} onChange={handleEventDateChange} />
        </label>
        <br />
        <label>
          Lugar:
          <input type="text" value={location} onChange={handleLocationChange} />
        </label>
        <br />
        <label>
          Presupuesto:
          <input type="number" value={budget} onChange={handleBudgetChange} />
        </label>
        <br />
        <label>
          Email:
          <input type="email" value={email} onChange={handleEmailChange} />
        </label>
        <br />
        <button type="submit">Generar PDF y Guardar Usuario</button>
      </form>
    </div>
  );
};

const UsuariosGuardados = ({
  users,
  generatePDF,
  events,
  selectedEvent,
  handleEventChange,
}) => {
  const filteredUsers = selectedEvent ? events[selectedEvent] : users;

  return (
    <div>
      <h1>Usuarios Guardados</h1>
      <label>
        Evento:
        <select value={selectedEvent} onChange={handleEventChange}>
          <option value="">Seleccionar Evento</option>
          {Object.keys(events).map((event) => (
            <option key={event} value={event}>
              {event}
            </option>
          ))}
        </select>
      </label>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Fecha del evento</th>
            <th>Lugar</th>
            <th>Presupuesto</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.eventDate}</td>
              <td>{user.location}</td>
              <td>{user.budget}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => generatePDF(user)}>Imprimir PDF</button>
                {user.received ? (
                  <span>Recibido</span>
                ) : (
                  <button onClick={() => console.log('Evento completado')}>Recibido</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
 
/* import React, { useState, useEffect } from 'react';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import mongoose from 'mongoose';


mongoose.connect("mongodb+srv://maxwinicki:perr01234@cluster1.njkoqwj.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

const userSchema = new mongoose.Schema({
  name: String,
  eventDate: Date,
  location: String,
  budget: Number,
  email: String,
  received: Boolean,
});

const User = mongoose.model('User', userSchema);

const App = () => {
  const [events, setEvents] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await User.find().exec();
        const events = {};

        users.forEach((user) => {
          if (events[user.eventName]) {
            events[user.eventName].push(user);
          } else {
            events[user.eventName] = [user];
          }
        });

        setEvents(events);
        setUsers(users);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleEventCreate = (eventName) => {
    setEvents((prevEvents) => ({
      ...prevEvents,
      [eventName]: [],
    }));
  };

  const handleSaveUser = async (eventName, name, eventDate, location, budget, email) => {
    const newUser = new User({
      name,
      eventDate,
      location,
      budget,
      email,
      received: false,
    });

    try {
      await newUser.save();

      setEvents((prevEvents) => ({
        ...prevEvents,
        [eventName]: [...prevEvents[eventName], newUser],
      }));

      setUsers([...users, newUser]);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const generatePDF = async (user) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([200, 100]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText(`bridenformal`, { x: 5, y: 80, size: 15, font });
    page.drawText(`Nombre: ${user.name}`, { x: 5, y: 70, size: 8, font });
    page.drawText(`#Cliente: ${user._id}`, { x: 5, y: 60, size: 8, font });
    page.drawText(`Fecha del evento: ${user.eventDate}`, { x: 5, y: 50, size: 8, font });
    page.drawText(`Lugar: ${user.location}`, { x: 5, y: 40, size: 8, font });
    page.drawText(`Presupuesto: ${user.budget}`, { x: 5, y: 30, size: 8, font });
    page.drawText(`Email: ${user.email}`, { x: 5, y: 20, size: 8, font });

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;

    document.body.appendChild(iframe);

    iframe.contentWindow.print();

    try {
      await User.findByIdAndUpdate(user._id, { received: true });
    } catch (error) {
      console.error('Error updating user:', error);
    }

    setUsers((prevUsers) =>
      prevUsers.map((prevUser) =>
        prevUser._id === user._id ? { ...prevUser, received: true } : prevUser
      )
    );
  };

  const handleEventChange = (e) => {
    setSelectedEvent(e.target.value);
  };

  const filteredUsers = selectedEvent ? events[selectedEvent] : users;

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/eventos">Eventos</Link>
            </li>
            <li>
              <Link to="/usuarios">Usuarios Guardados</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home handleEventCreate={handleEventCreate} />} />
          <Route
            path="/eventos"
            element={<Eventos events={events} handleSaveUser={handleSaveUser} />}
          />
          <Route
            path="/usuarios"
            element={
              <UsuariosGuardados
                users={filteredUsers}
                generatePDF={generatePDF}
                events={events}
                selectedEvent={selectedEvent}
                handleEventChange={handleEventChange}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

const Home = ({ handleEventCreate }) => {
  const [eventName, setEventName] = useState('');

  const handleEventNameChange = (e) => {
    setEventName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleEventCreate(eventName);
    setEventName('');
  };

  return (
    <div>
      <h1>Inicio</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre del Evento:
          <input type="text" value={eventName} onChange={handleEventNameChange} />
        </label>
        <br />
        <button type="submit">Crear Evento</button>
      </form>
    </div>
  );
};

const Eventos = ({ events, handleSaveUser }) => {
  const [eventName, setEventName] = useState('');
  const [name, setName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [email, setEmail] = useState('');

  const handleEventNameChange = (e) => {
    setEventName(e.target.value);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEventDateChange = (e) => {
    setEventDate(e.target.value);
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handleBudgetChange = (e) => {
    setBudget(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveUser(eventName, name, eventDate, location, budget, email);
    setName('');
    setEventDate('');
    setLocation('');
    setBudget('');
    setEmail('');
  };

  return (
    <div>
      <h1>Eventos</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Evento:
          <select value={eventName} onChange={handleEventNameChange}>
            <option value="">Seleccionar Evento</option>
            {Object.keys(events).map((event) => (
              <option key={event} value={event}>
                {event}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Nombre:
          <input type="text" value={name} onChange={handleNameChange} />
        </label>
        <br />
        <label>
          Fecha del evento:
          <input type="date" value={eventDate} onChange={handleEventDateChange} />
        </label>
        <br />
        <label>
          Lugar:
          <input type="text" value={location} onChange={handleLocationChange} />
        </label>
        <br />
        <label>
          Presupuesto:
          <input type="number" value={budget} onChange={handleBudgetChange} />
        </label>
        <br />
        <label>
          Email:
          <input type="email" value={email} onChange={handleEmailChange} />
        </label>
        <br />
        <button type="submit">Generar PDF y Guardar Usuario</button>
      </form>
    </div>
  );
};

const UsuariosGuardados = ({
  users,
  generatePDF,
  events,
  selectedEvent,
  handleEventChange,
}) => {
  const filteredUsers = selectedEvent ? events[selectedEvent] : users;

  return (
    <div>
      <h1>Usuarios Guardados</h1>
      <label>
        Evento:
        <select value={selectedEvent} onChange={handleEventChange}>
          <option value="">Seleccionar Evento</option>
          {Object.keys(events).map((event) => (
            <option key={event} value={event}>
              {event}
            </option>
          ))}
        </select>
      </label>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Fecha del evento</th>
            <th>Lugar</th>
            <th>Presupuesto</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.eventDate}</td>
              <td>{user.location}</td>
              <td>{user.budget}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => generatePDF(user)}>Imprimir PDF</button>
                {user.received ? (
                  <span>Recibido</span>
                ) : (
                  <button onClick={() => console.log('Evento completado')}>Recibido</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;

 */