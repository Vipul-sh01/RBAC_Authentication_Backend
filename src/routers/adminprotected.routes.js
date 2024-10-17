import { Router } from "express";
import { adminAccess} from "../controllers/access.controller.js";
import { verifyJWT } from "../middlewares/auth.js";
import { roleAuth } from "../middlewares/role.middlewares.js";

const router = Router();

router.route('/dashboard').get(verifyJWT, roleAuth(['admin']), adminAccess);

export default router;