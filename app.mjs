import express from 'express'
import cors from 'cors'
import fileUpload from 'express-fileupload'

const app = express()
const port = process.env.PORT || 8080
app.use(express.json())
app.use(cors())

let todoItems = {
    "ai": {
        "items": [
            {
                "text": "123",
                "id": 1664046906811
            },
            {
                "text": "456",
                "id": 1664046907663
            },
            {
                "text": "789",
                "id": 1664046908951
            }
        ]
    }
}
app.use(express.static('uploads'))

app.use(fileUpload({
    createParentPath: true
}))

app.post('/:course/upload', async (req, res) => {
    // console.log(req.files);    
    const course = req.params.course
    try {
        if (!req.files) {
            res.status(400).send({
                msg: "Something went wrong"
            })
        } else {
            let uploadedFile = req.files.uploadedFile
            console.log(uploadedFile.name);
            uploadedFile.mv(`./uploads/${course}/${uploadedFile.name}`)
            todoItems[course].items.push({
                filename: uploadedFile.name,
                id : Date.now()
            })
            res.send({
                msg: 'file uploaded',
                data:todoItems
            })
        }
    } catch (error) {
        console.log(error);
    }
})


app.post('/courses', (req, res) => {
    let course = req.body.course
    if (course in todoItems) {
        res.send({
            msg: 'course found',
            data: todoItems
        })
    } else {
        todoItems[course] = { items: [] }
        res.send({
            msg: 'new course added',
            data: todoItems
        })
    }
})

app.get('/todoItems', (req, res) => {
    if (Object.keys(todoItems).length > 0) {
        res.send({
            msg: 'Data Found',
            data: todoItems
        })
    } else {
        res.status(400).send({
            msg: 'Data not Found',
        })
    }
})

app.post('/todoItem', (req, res) => {
    console.log(req.body);
    let course = req.body.course
    let todoItem = req.body.todoItem
    if (course in todoItems) {
        todoItems[course].items.push(todoItem)
        res.send({
            msg: 'saved your data',
            data: todoItems
        })
    } else {
        res.status(400).send({
            msg: 'Course is not found , plz add course first'
        })
    }
})

app.put('/todoItem/:course/:id', (req, res) => {
    const text = req.body.text
    const id = +req.params.id
    const course = req.params.course
    let data = todoItems[course].items
    const found = data.some(item => item.id === id);

    if (!found) {
        res.status(400).send({ msg: `No item with id of ${id} found` });
    } else {
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (element.id === id) {
                element.text = text
                todoItems[course].items = data
                console.log(`item edited with ${id}`);
                res.send({
                    msg: 'item updated',
                    data: todoItems
                });
                break
            }
        }
    }

})

app.delete('/todoItem/:course/:id', (req, res) => {
    const id = +req.params.id
    const course = req.params.course
    console.log(id,course);
    let data = todoItems[course].items
    const found = data.some(item => item.id === id);

    if (!found) {
        res.status(400).send({ msg: `No item with id of ${id} found` });
    } else {
        todoItems[course].items = data.filter(item => item.id !== id);
        console.log(`item deleted with ${id}`);
        res.send({
            msg: 'item deleted',
            data: todoItems
        });
    }
})

app.delete('/:course', (req, res) => {
    const course = req.params.course
    todoItems[course] = { items: [] }
    res.send({
        msg: `Data cleared for ${course}`
    })
})

app.get('/', (req, res) => {
    res.send(`<h1>Hello Obaid :)</h1> 
    <h3>You are hiting me with ${req.ip}</h3>`)
})

app.get('*', (req, res) => {
    res.send(`404`)
})


app.listen(port, () => {
    console.log(`server is running on ${port}`);
})
