import { Router } from 'express';
import {listOpportunities,getOpportunity,createOpportunity,updateOpportunity,deleteOpportunity} from '../controllers/opportuniteController.ts';
const opportuniteRouter = Router();

opportuniteRouter.get('/',listOpportunities);       
opportuniteRouter.get('/:id',getOpportunity);       
opportuniteRouter.post('/',createOpportunity);      
opportuniteRouter.put('/:id',updateOpportunity);    
opportuniteRouter.delete('/:id',deleteOpportunity);  

export default opportuniteRouter;
