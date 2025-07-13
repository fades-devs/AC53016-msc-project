import express from 'express';
import {getModuleByCode, getModules} from "../controllers/module.controller.js";

// Create a router instance (to handle routes)
const router = express.Router();

// All the endpoints in this file (get/post/put...)

// @route   GET /api/modules
// /api/modules?level=1
router.get('/', getModules);

// @route   GET /api/modules/:moduleCode
router.get('/:moduleCode', getModuleByCode);

export default router;