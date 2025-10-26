import cors from 'cors'
import connectDb from '../DB/connection.js';
const initApp = (app, express) => {
  app.use(express.json());
  app.use(cors());
  app.get('/', (req, res) => {
    res.status(200).json({ message: "welcome..." });
  });

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
};

export default initApp;
