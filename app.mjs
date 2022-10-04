import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

const app = express()
const port = process.env.PORT || 8080
app.use(express.json())
app.use(cors())

let dbUri = 'mongodb+srv://obaidmuneer:Abc123@cluster0.jop1spc.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(dbUri)

let todoSchema = new mongoose.Schema({
    text: { type: String, require: true },
    course: { type: String, require: true },
    createdAt: { type: Date, defaul: Date.now }
})
let todoModel = mongoose.model('todos', todoSchema)

app.get('/todos', (req, res) => {
    todoModel.find({}, (err, data) => {
        if (!err) {
            console.log(data);
            res.send({
                data
            })
        } else {
            res.status(500).send({
                msg: 'something is wrong'
            })
        }
    })
})

app.get('/todos/:course', (req, res) => {
    const course = req.params.course
    // console.log(course);
    todoModel.find({ course: { $eq: course } }, (err, data) => {
        if (!err) {
            res.send({
                data: data
            })
        }
    })
})

app.post('/todo', (req, res) => {
    let course = req.body.course
    let text = req.body.text
    todoModel.create({
        course,
        text
    }, (err, data) => {
        if (!err) {
            res.send({
                msg: 'Your item is saved',
                data: data
            })
        } else {
            res.status(500).send({
                msg: 'Something went wrong'
            })
        }
    })
})

app.put('/todo/:id', (req, res) => {
    const text = req.body.text
    const id = req.params.id
    todoModel.findByIdAndUpdate(id, { text: text }, (err, data) => {
        res.send({
            data: data
        })
    });
})

app.delete('/todo/:id', (req, res) => {
    const id = req.params.id
    console.log(id);
    todoModel.findByIdAndDelete(id, (err, data) => {
        res.send({
            data: data
        })
    })
})

app.delete('/todos/:course', (req, res) => {
    const course = req.params.course
    todoModel.deleteMany({ course: { $eq: course } }, (err, data) => {
        if (!err) {
            res.send({
                data
            })
        }
    })
})

app.get('*', (req, res) => {
    res.status(404).send('Page not Found')
})

app.listen(port, () => {
    console.log(`server is running on ${port}`);
})
