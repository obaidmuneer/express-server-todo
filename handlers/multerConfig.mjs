import multer from 'multer'

const storage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //     cb(null, './uploads')
    // },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (!file.mimetype.match(/jpe|jpeg|png|gif$i/)) {
        cb(new Error("Bad File", false))
    }
    cb(null, true)
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 4 },
    fileFilter: fileFilter
}).single('uploadedFile')

export { upload }