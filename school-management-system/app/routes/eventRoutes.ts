import { Router } from 'express';
import {createEvent,updateEvent,getEvent,deleteEvent, filterEvents} from '../controllers/eventController.ts';
import { requirePermission } from '../middlewares/permissionValidation.ts';

const eventRouter = Router();

eventRouter.post('/', requirePermission({ section: 'event', action: 'create' }), createEvent);
eventRouter.get('/filter', requirePermission({ section: 'event', action: 'read' }), filterEvents);
eventRouter.get('/:id', requirePermission({ section: 'event', action: 'read' }), getEvent);
eventRouter.put('/:id', requirePermission({ section: 'event', action: 'update' }), updateEvent);
eventRouter.delete('/:id', requirePermission({ section: 'event', action: 'delete' }), deleteEvent);

export default eventRouter;
