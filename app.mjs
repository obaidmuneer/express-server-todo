import express from 'express'
import cors from 'cors'
import { upload } from './handlers/multerConfig.mjs'
import { cloudinary } from './handlers/cloudinaryConfig.mjs'
import { todoModel } from "./model/todo.mjs";

const app = express()
const port = process.env.PORT || 8080

app.use(express.json())
app.use(cors())

app.post('/upload/:course', upload, async (req, res) => {
    try {
        // console.log(req.file);
        let result = await cloudinary.v2.uploader.upload(req.file.path)
        // console.log(result);
        let data = await todoModel.create({
            course: req.params.course,
            file: {
                link: result.secure_url,
                fileId: result.public_id
            },
            text: ''
        })
        res.send({
            msg: 'Your img is uploaded',
            data: data
        })

    } catch (error) {
        res.status(500).send({
            msg: 'something is wrong'
        })
    }
})

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

app.delete('/todo/:id', async (req, res) => {
    let id = req.params.id
    id = id.split(' ')
    let todoId = id[0]
    let imgId;
    let result;
    if (id.length > 1) {
        imgId = id[1]
        result = await cloudinary.uploader.destroy(imgId);
    }
    todoModel.findByIdAndDelete(todoId, (err, deletedData) => {
        res.send({
            data: {
                deletedData,
                result
            },
            msg: "Your item is deleted"
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
