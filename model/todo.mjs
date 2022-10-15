import mongoose from 'mongoose'

let dbUri = process.env.DB_URI
mongoose.connect(dbUri)

let todoSchema = new mongoose.Schema({
    course: { type: String, required: true },
    file: { type: Object },
    text: { type: String },
    createdAt: { type: Date, defaul: Date.now }
})
let todoModel = mongoose.model('todos', todoSchema)

export { todoModel }
