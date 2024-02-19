'use strict'

import Course from './course.model.js'

export const test = (req, res) => {
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

export const save = async(req, res) => {
    try {
        //Capturar la data
        let data = req.body
        //Crear la instancia
        let course = new Course(data)
        //Guardar el curso en la DB
        await course.save()
        //Responder al usuario
        return res.send({message: `${course.name} saved successfully`})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error saving course'})
    }
}

export const updateC = async(req, res) => {
    try {
        let { id } = req.params
        let data = req.body
        let update = (data, id)
        if(!update) return res.status(400).send({message: 'Have submit some data that cannot be update or missing data'})
        let updatedCourse = await Course.findOneAndUpdate(
            {_id: id},
            data,
            {new: true}
        )
        if(!updatedCourse) return res.status(401).send({message: 'Course not found and not updated'})
        return res.send({message: 'Updated Course', updatedCourse})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error updating course'})
    }
}

export const deleteC = async(req, res) => {
    try {
        let { id } = req.params
        let deletedCourse = await Course.findOneAndDelete({_id: id})
        if(!deletedCourse) return res.status(404).send({message: 'Course not found and not deleted'})
        return res.send({message: `Course ${deletedCourse.name} deleted successfully`})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error deleting course'})
    }
}

export const showCourse = async(req, res) => {
    try {
        let results = await Course.find();
        if(!results) return res.status(400).send({message:`Empty collection.`})
        return res.send({ results });
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Nothing to show'})
    }
}

