import cors from 'cors';
import connectDb from '../DB/connection.js';
import authRouter from './modules/auth/auth.router.js';
import categoryRouter from './modules/category/category.router.js';
import productRouter from './modules/Product/product.router.js';
import couponRouter from './modules/coupon/coupon.router.js'
const initApp = async (app, express) => {
  app.use(express.json());
  app.use(cors());

  await connectDb();

  app.get('/', (req, res) => res.status(200).json({ message: "welcome..." }));

  app.use('/auth', authRouter);
  app.use('/categories', categoryRouter);
  app.use('/products', productRouter);
  app.use('/coupon',couponRouter)

  app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
};

export default initApp;
