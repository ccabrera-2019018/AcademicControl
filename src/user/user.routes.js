import express from "express";
import { isTeacher, validateJwt } from "../middlewares/validate-jws.js";
import { asignCourse, deleteU, designStudent, login, register, registerStudent, showMyCourse, test, update } from "./user.controller.js";

const api = express.Router()

//RUTAS PUBLICAS

api.post('/register', register)
api.post('/registerStudent', registerStudent)
api.post('/login', login)
api.get('/showMyCourse',[validateJwt], showMyCourse)
api.post('/asignCourse', asignCourse)

//RUTAS PRIVADAS
                    //Middleware
api.get('/test', [validateJwt], test)
api.put('/update/:id', [validateJwt], update) //Middleware -> funciones intermedias que sirven para validar
api.delete('/delete/:id',[validateJwt], deleteU)
api.delete('/designStudent',[validateJwt], designStudent)

export default api