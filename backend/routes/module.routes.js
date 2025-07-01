import express from 'express';
import {findModuleByCode, getModules} from "../controllers/module.controller.js";

// Create a router instance (to handle routes)
const router = express.Router();

// All the endpoints in this file (get/post/put...)

// @route   GET /api/modules
// /api/modules?level=1
router.get('/', getModules);

// @route GET /api/modules/lookup?code=AC0001
router.get('/lookup', findModuleByCode);

export default router;