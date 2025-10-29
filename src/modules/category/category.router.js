import {Router} from 'express';
import { auth } from '../../middleware/auth.js';
import * as controller from './category.controller.js'
const router = Router();

router.post('/',auth(['admin']),controller.create);
router.get('/',auth(['user','admin']),controller.get);

export default router;