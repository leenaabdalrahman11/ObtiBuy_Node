import {Router} from 'express';
import { auth } from '../../middleware/auth.js';
import * as controller from './review.controller.js';
const router = Router({mergeParams:true});

router.post('/',auth(['user']),controller.create);
export default router;