import {Router} from 'express';
import { auth } from '../../middleware/auth.js';
import * as controller from './coupon.controller.js'
import fileUpload, { fileValidation } from '../../utils/multer.js';

const router = Router();

router.post('/',auth(['admin']),controller.create);
router.get('/',auth(['admin']) ,controller.get);

export default router;