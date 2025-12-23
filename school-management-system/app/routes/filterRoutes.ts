import { Router } from 'express';
import { filterData } from '../utilities/filter.ts';
const filterRouter = Router();

filterRouter.get('/filter',filterData );


export default filterRouter;