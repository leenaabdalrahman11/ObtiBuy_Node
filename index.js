import express from 'express';
import cors from 'cors';
import initApp from './src/app.router.js';
import 'dotenv/config';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

initApp(app, express);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
