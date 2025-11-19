import {Router} from 'express';
import { auth } from '../../middleware/auth.js';
import * as controller from './cart.controller.js'
import fileUpload, { fileValidation } from '../../utils/multer.js';

const router = Router();

router.post('/',auth(['user']),controller.addToCart);
export default router;