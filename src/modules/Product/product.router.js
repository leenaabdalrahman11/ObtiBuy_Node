import {Router} from 'express';
import { auth } from '../../middleware/auth.js';
import * as controller from './product.controller.js';
import fileUpload, { fileValidation } from '../../utils/multer.js';
import reviewRouter from './../review/review.router.js';


const router = Router();

router.use('/:productId/reviews',reviewRouter)
router.post('/',auth(['admin']),fileUpload(fileValidation.image).fields([
    {name:'mainImage',maxCount:1},
    {name:'subImages',maxCount:4}
]),controller.create);


router.get('/',auth(['admin']),controller.get);
router.get('/active',controller.getActive);
router.get('/:id',controller.getDetails);
router.delete('/:id',auth(['admin']),controller.remove);




export default router;