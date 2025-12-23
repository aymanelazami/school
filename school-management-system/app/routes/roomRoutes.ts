import { Router } from 'express';
import { getRoom, getAllRooms, createRoom, deleteRoom, updateRoom, filterRooms } from '../controllers/roomController.ts'
import { requirePermission } from '../middlewares/permissionValidation.ts';


const roomRouter = Router();
// Note: attachPermissions middleware was removed - permissions are now handled via JWT tokens

roomRouter.get('/filter', requirePermission({ section: 'room', action: 'read' }), filterRooms);
roomRouter.post('/', requirePermission({ section: 'room', action: 'create' }), createRoom);
roomRouter.get('/:id', requirePermission({ section: 'room', action: 'read' }), getRoom);
roomRouter.put('/:id', requirePermission({ section: 'room', action: 'update' }), updateRoom);
roomRouter.delete('/:id', requirePermission({ section: 'room', action: 'delete' }), deleteRoom);


export default roomRouter;