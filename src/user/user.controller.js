'use strict'

import { encrypt, checkPassword, checkUpdate } from '../utils/validator.js'
import User from './user.model.js'
import { generateJwt } from '../utils/jwt.js'
import jwt from 'jsonwebtoken'

export const test = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is runing' })
}

export const register = async (req, res) => {
    try {
        //Captturar el foormulario (body)
        let data = req.body
        //Encriptar la contraseña
        data.password = await encrypt(data.password)
        //Asignar el rol por defecto
        //data.role = 'CLIENT'
        //Guardar la informacion en a DB
        let user = new User(data)
        await user.save()
        //Responder al usuario
        return res.send({ message: `Registered successfully, can be logged with username ${user.username}` })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error registering user' })

    }
}

export const registerStudent = async (req, res) => {
    try {
        //Captturar el foormulario (body)
        let data = req.body
        //Encriptar la contraseña
        data.password = await encrypt(data.password)
        //Asignar el rol por defecto
        data.role = 'STUDENT'
        //Guardar la informacion en a DB
        let user = new User(data)
        await user.save()
        //Responder al usuario
        return res.send({ message: `Registered successfully, can be logged with username ${user.username}` })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error registering user' })

    }
}

export const login = async (req, res) => {
    try {
        //Capturar los datos (body)
        let { username, password } = req.body
        //Validar que el usuario exista
        let user = await User.findOne({ username }) //buscar un solo registro. username: 'ccabrera'
        //Verifico que la contraseña coincida
        if (user && await checkPassword(password, user.password)) {
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }
            //Generar Token
            let token = await generateJwt(loggedUser)
            //Responder al usuario
            return res.send({ message: `Welcome ${loggedUser.name}`, loggedUser, token })
        }
        return res.status(404).send({ message: 'Invalid credential' })
    } catch (error) {
        console.error(err)
        return res.status(500).send({ message: 'Error to login' })
    }
}

export const update = async (req, res) => {
    try {
        //Obtener el id del usuario a actulizar
        let { id } = req.params
        //Obtener los datos a actualizar
        let data = req.body
        //Validar si data trae datos
        let update = checkUpdate(data, id)
        if (!update) return res.status(400).send({ message: 'Have submit some data that cannot be update or missing data' })
        //Validar si tiene permisos (tokenización)
        //Actualizar (DB)
        let updatedUser = await User.findOneAndUpdate(
            { _id: id }, //Objects <- hexadecimales (Hora sys, Version Mongo, Llaver privada...) asi guarda mongoDB los ID
            data, //Los datos que se van a actualizar
            { new: true } //Objeto de la DB ya actualizado
        )
        //Validar la actualización
        if (!updatedUser) return res.status(401).send({ message: 'User not found and not updated' })
        //Respondo el usuario
        return res.send({ message: 'Updated user', updatedUser })
    } catch (err) {
        console.error(err)
        if (err.keyValue.username) return res.status(400).send({ message: `Username ${err.keyValue.username} is already taken` })
        return res.status(500).send({ message: 'Error updating account' })
    }
}

export const deleteU = async (req, res) => {
    try {
        //Obtener el Id
        let { id } = req.params
        //Validar si esta logeado y es el mismo
        //Eliminar (deleteOne / FindOneAndDelete)
        let deletedUser = await User.findOneAndDelete({ _id: id })
        //Verificar que se elimino
        if (!deletedUser) return res.status(404).send({ message: 'Account no found and not deleted' })
        //Responder
        return res.send({ message: `Account with username ${deletedUser.username} deleted successfully` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error deleting accout' })
    }
}

export const showMyCourse = async (req, res) => {
    try {
        // Recuperar el token de los headers
        const token = req.headers.authorization;

        // Validar y extraer el rol y el id del usuario desde el token
        const { role, uid } = jwt.verify(token, process.env.SECRET_KEY);
        if (!role) return res.status(400).json({ message: 'User role not found from token.' });

        // Según el rol del usuario, buscar los cursos correspondientes
        switch (role) {
            case 'TEACHER':
                const coursesForTeacher = await Course.find({ teacher: uid }).populate('students', ['name', 'surname', 'email']);
                return res.status(200).json({ courses: coursesForTeacher });
            case 'STUDENT':
                const coursesForStudent = await Course.find({ students: uid }).populate('teacher', ['name', 'surname', 'email']);
                return res.status(200).json({ courses: coursesForStudent });
            default:
                return res.status(400).json({ message: 'Invalid user role.' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error showing courses' });
    }
};


export const createTeacher = async () => {
    try {
        let user = await User.findOne({ username: 'jnoj' });
        if (!user) {
            console.log('Creando profesor...')
            let teacher = new User({
                name: 'Josue',
                surname: 'Noj',
                username: 'jnoj',
                password: '12345',
                email: 'jnoj@kinal.org.gt',
                phone: '87654321',
                role: 'TEACHER'
            });
            teacher.password = await encrypt(teacher.password);
            await teacher.save();
            return console.log({ message: `Registered successfully. \nCan be logged with username ${teacher.username}` })
        }
        console.log({ message: `Can be logged with username ${user.username}` });

    } catch (err) {
        console.error(err);
        return err;
    }
}

export const asignCourse = async (req, res) => {
    try {
        let token = req.headers.authorization

        if (!token) {
            return res.status(401).json({ message: 'Authorization token not provided' });
        }
        // Decodificar el token para obtener el ID del usuario
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        const id = decodedToken.uid;
        // Extraer el ID del curso del cuerpo de la solicitud
        const { course } = req.body;
        if (!course) {
            return res.status(400).json({ message: 'Course ID required.' });
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Student not found' });
        }
        user.course.push(course);
        await user.save();
        return res.status(200).json({ message: 'Course asigned successfully' });
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error to asign the course' })
    }
}