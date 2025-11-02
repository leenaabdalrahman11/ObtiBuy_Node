import {Router} from 'express';
import { auth } from '../../middleware/auth.js';
import * as controller from './category.controller.js'
const router = Router();

router.post('/',auth(['admin']),controller.create);
router.get('/',auth(['admin']),controller.get);
router.get('/:id',controller.details);
router.get('/active',controller.getActive);
router.put('/:id',controller.update);
router.delete('/:id',auth(['admin']),controller.remove);

export default router;