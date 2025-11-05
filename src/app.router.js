import cors from 'cors';
import connectDb from '../DB/connection.js';
import authRouter from './modules/auth/auth.router.js';
import categoryRouter from './modules/category/category.router.js';

const initApp = async (app, express) => {
  app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));
  app.use(express.json());
  app.use(cors());

  await connectDb();

  app.get('/', (req, res) => res.status(200).json({ message: "welcome..." }));

  app.use('/auth', authRouter);
  app.use('/categories', categoryRouter);

  app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
};

export default initApp;
