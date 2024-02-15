import { Router } from 'express';
import  {healthcheck} from '../controllers/heathcheck.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT)
router.route('/').get(healthcheck);

export default router