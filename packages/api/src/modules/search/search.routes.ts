import { Router } from 'express';
import { SearchController } from './search.controller.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { searchQuerySchema, suggestQuerySchema } from './search.validation.js';

const router = Router();

router.get('/', validateRequest(searchQuerySchema, 'query'), SearchController.search);
router.get('/suggest', validateRequest(suggestQuerySchema, 'query'), SearchController.suggest);

export { router as searchRoutes };
