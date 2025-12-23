import { type Request, type Response } from 'express';
//import { filterAttendanceLists } from '../controllers/attendanceListController.ts';
import { filterEvents } from "../controllers/eventController.ts";
import { filterRooms } from '../controllers/roomController.ts';
//import { filterFilieres } from '../controllers/filiereController.ts';
//import { filterRoles } from '../controllers/rolesController.ts';
//import { filterAbsences } from '../controllers/absenceController.ts';
//import { filterDocuments } from '../controllers/documentsController.ts';
//import { filterOpportunities } from '../controllers/opportuniteController.ts';
//import { filterRessources} from '../controllers/resourcesController.ts';
//import { filterSessions } from '../controllers/sessionsController.ts';
//import {filterUsers} from '../controllers/usersController.ts';
//import {filterNiveaux} from '../controllers/niveauController.ts';
//import { filterGroupes } from '../controllers/groupeController.ts';
import { filterModules } from '../controllers/moduleController.ts';
//import { filterGrades } from '../controllers/gradesController.ts';

export const filterData = async (req: Request, res: Response) => {
    try {
        const { table } = req.query;
        if (!table) {
            return res.status(400).json({ message: "Veuillez spécifier une table (ex: ?table=events)" });
        }

        switch (table) {
            case "events":
                return await filterEvents(req, res);


            /*case "attendanceList":
                return await filterAttendanceLists(req, res);*/


            case "rooms":
                return await filterRooms(req, res);


            /*case "filiere":
                return await filterFilieres(req, res);


            case "roles":
                return await filterRoles(req, res);*/


            case "modules":
                return await filterModules(req, res);


            /*case "absences":
                return await filterAbsences(req, res);


            case "documents":
                return await filterDocuments(req, res);


            case "opportunities":
                return await filterOpportunities(req, res);


            case "resources":
                return await filterRessources(req, res);


            case "sessions":
                return await filterSessions(req, res);

            case "users":
                return await filterUsers(req, res);

            case "niveau":
                return await filterNiveaux(req, res);    

            case "groupes":
                return await filterGroupes(req, res);

            case "grades":
                return await filterGrades(req, res);    
                    
                */

            default:
                return res.status(400).json({ message: `Aucune fonction de filtre trouvée pour ${table}` });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne dans filterData" });
    }
};