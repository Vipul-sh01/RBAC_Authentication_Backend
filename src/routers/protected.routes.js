import { Router } from "express";
import { adminAccess,userAccess} from "../controllers/access.controller.js";
import { verifyJWT } from "../middlewares/auth.js";
import { roleAuth } from "../middlewares/role.middlewares.js";

const router = Router();

router.route('/dashboard').get(verifyJWT, roleAuth(['admin']), adminAccess);
router.route('/dashboard').get(verifyJWT, roleAuth(['user']), userAccess);
export default router;