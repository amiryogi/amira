import { Request, Response } from 'express';
import { SearchService } from './search.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse, sendPaginatedResponse } from '../../common/responseFormatter.js';

const searchService = new SearchService();

export class SearchController {
  static search = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await searchService.search(req.query as Record<string, string>);
    sendPaginatedResponse(res, 'Search results', result.data, result.pagination);
  });

  static suggest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const suggestions = await searchService.suggest(req.query as Record<string, string>);
    sendResponse(res, 200, 'Suggestions retrieved', suggestions);
  });
}
