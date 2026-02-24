import { Router } from 'express';
import { AddressController } from './address.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { validateObjectId } from '../../middlewares/validateObjectId.js';
import { addressSchema, updateAddressSchema } from './address.validation.js';

const router = Router();

router.use(authMiddleware);

router.get('/', AddressController.getAll);
router.post('/', validateRequest(addressSchema), AddressController.create);
router.put('/:id', validateObjectId(), validateRequest(updateAddressSchema), AddressController.update);
router.delete('/:id', validateObjectId(), AddressController.delete);
router.put('/:id/default', validateObjectId(), AddressController.setDefault);

export { router as addressRoutes };
