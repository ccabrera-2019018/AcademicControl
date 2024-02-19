import express from "express";
import { isTeacher, validateJwt } from "../middlewares/validate-jws.js";
import { deleteC, save, showCourse, updateC, test } from "./course.controller.js";


const api = express.Router()

api.get('/test', test)

//RUTAS PRIVADAS (solo TEACHERS)
api.post('/save',[validateJwt, isTeacher], save)
api.put('/updateC/:id',[validateJwt, isTeacher], updateC)
api.delete('/deleteC/:id',[validateJwt, isTeacher], deleteC)
api.get('/showCourse', [validateJwt], showCourse)

//RUTAS PUBLICAS
//api.post('/showCourse', showCourse)

export default api