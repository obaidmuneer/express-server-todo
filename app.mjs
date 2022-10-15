import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import multer from 'multer'
import cloudinary from 'cloudinary'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

const app = express()
const port = process.env.PORT || 8080
dotenv.config()

app.use(express.json())
app.use(cors())

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

let dbUri = 'mongodb+srv://obaidmuneer:Abc123@cluster0.jop1spc.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(dbUri)

let todoSchema = new mongoose.Schema({
    course: { type: String, required: true },
    file: { type: Object },
    text: { type: String },
    createdAt: { type: Date, defaul: Date.now }
})
let todoModel = mongoose.model('todos', todoSchema)

const storage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //     cb(null, './uploads')
    // },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })

app.get('/upload', (req, res) => {
    imgModel.find({}, (err, data) => {
        if (!err) {
            res.send({
                data
            })
        }
    })
})

app.delete('/upload/:id', async (req, res) => {
    let result = await cloudinary.uploader.destroy(req.params.id);
    res.send({
        msg: 'img is deleted'
    })
})

app.post('/upload/:course', upload.single('uploadedFile'), async (req, res) => {
    // console.log(req.file);
    let result = await cloudinary.v2.uploader.upload(req.file.path)
    // console.log(result);
    todoModel.create({
        course: req.params.course,
        file: {
            link: result.secure_url,
            fileId: result.public_id
        },
        text: ''
    }, (err, data) => {
        if (!err) {
            res.send({
                msg: 'Your img is uploaded',
                data: data
            })
        }
    })
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

app.delete('/todo/:id', async(req, res) => {
    let id = req.params.id
    id = id.split(' ')
    let todoId = id[0]
    let imgId;
    let result;
    if (id.length > 1) {
        imgId = id[1]
        result = await cloudinary.uploader.destroy(imgId);
    }
    todoModel.findByIdAndDelete(todoId, (err, data) => {
        res.send({
            data: {
                data,
                result : result || ''
            }
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
