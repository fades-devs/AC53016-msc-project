import express from 'express';
import {getModuleByCode, getModules} from "../controllers/module.controller.js";

// Create a router instance (to handle routes)
const router = express.Router();

// @route   GET /api/modules
router.get('/', getModules);

// @route   GET /api/modules/:moduleCode
router.get('/:moduleCode', getModuleByCode);

export default router;