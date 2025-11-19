import {Router} from 'express';
import { auth } from '../../middleware/auth.js';
import * as controller from './order.controller.js';
const router = Router();

router.post('/',auth(['user']),controller.create);
router.get('/',auth(['user']),controller.getUserOrders);
router.get('/:status',auth(['admin']),controller.getOrdersByStatus);
router.patch('/changeStatus/:orderId',auth(['admin']),controller.changeStatus);
export default router;