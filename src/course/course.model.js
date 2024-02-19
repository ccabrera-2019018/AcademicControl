import mongoose from "mongoose";

const courseSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
},{
        versionKey: false
})

export default mongoose.model('course', courseSchema)