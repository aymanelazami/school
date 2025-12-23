import { Router } from 'express';
import { requirePermission } from '../middlewares/permissionValidation.ts';
import {createRole,deleteRole,getRole,updateRole,getAllRoles} from '../controllers/rolesController.ts';


const roleRouter = Router();

roleRouter.post('/', requirePermission({ section: 'role', action: 'create' }), createRole);
roleRouter.put('/:id', requirePermission({ section: 'role', action: 'update' }), updateRole);
roleRouter.get('/:id', requirePermission({ section: 'role', action: 'read' }), getRole);
roleRouter.get('/', requirePermission({ section: 'role', action: 'read' }), getAllRoles);
roleRouter.delete('/:id', requirePermission({ section: 'role', action: 'delete' }), deleteRole);

export default roleRouter;