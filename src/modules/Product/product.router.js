import {Router} from 'express';
import { auth } from '../../middleware/auth.js';
import * as controller from './product.controller.js';
import fileUpload, { fileValidation } from '../../utils/multer.js';
const router = Router();

router.post('/',auth(['admin']),fileUpload(fileValidation.image).fields([
    {name:'mainImage',maxCount:1},
    {name:'subImages',maxCount:4}
]),controller.create);
export default router;