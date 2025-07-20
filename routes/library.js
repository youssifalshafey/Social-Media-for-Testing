const router = require('express').Router();

const multer = require('multer');

const getCookie = require("../functions/getCookie");
const { getSession, getSessionName } = require("../functions/sessions");

const path = require("path");
const fs = require("fs");

const {maxClass} = require("../saves/serverConfig.json");

const {getClass} = require("../functions/userInfo")
/**
 * @type {Map<number, {count: number, id: number, location: string}}
 */
const uploadMap = new Map();


const libraryFolder = path.join(__dirname, "..", "saves", "library");
if(!fs.existsSync(libraryFolder)){
    fs.mkdirSync(libraryFolder)
    fs.writeFileSync(path.join(libraryFolder, "nextId.txt"), "1");
}

for (let i = 1; i < maxClass + 1; i++) {
    if(!fs.existsSync(path.join(libraryFolder, i.toString()))){
        fs.mkdirSync(path.join(libraryFolder, i.toString()));
        // fs.writeFileSync(path.join(libraryFolder, i.toString(), "index.json"), "{}");
    }
}

let nextId = parseInt(
    fs.readFileSync(path.join(__dirname, "..", "saves", "library", "nextId.txt"), "utf-8")
);

// let nextId = fs.readFileSync(path.join(libraryFolder, "nextId.txt"), "utf-8");

function checkAuth(req, res, next) {
    if (!req.headers.cookie)
        return res.status(401).send({ msg: "No cookies provided" });
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (!exist) return res.status(401).send({ msg: "Not Authenticated" });
    next();
}

function checkSubject(req, res, next) {
    const requestedClass = req.params.class;
    if(!requestedClass)
        return res.status(400).send({msg: "class name is required"})

    if(!fs.existsSync(path.join(libraryFolder, requestedClass)))
        return res.status(404).send({msg: "This class doesn't exist"})

    const requestedSubject = req.query.subject;
    if(!requestedSubject)
        return res.status(400).send({msg: "Subject name is required"})

    const subjectFolder = path.join(libraryFolder, requestedClass, requestedSubject)

    if(!fs.existsSync(subjectFolder))
        return res.status(404).send({msg: "This subject doesn't exist"})

    next();
}

function checkClass(req, res, next) {
    const requestedClass = req.params.class;
    if(!requestedClass)
        return res.status(400).send({msg: "class name is required"})

    if(!fs.existsSync(path.join(libraryFolder, requestedClass)))
        return res.status(404).send({msg: "This class doesn't exist"})
    
    next();
}

router.get("/", (req, res) => {
    if (!req.headers.cookie) return res.redirect("/login");
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (exist) {
        res.send("This si supposed to be an html file but untill then this is all you get");
    } else {
        res.redirect("/login");
    }
})

router.get("/class/:class", checkAuth, checkClass, async(req, res) => {
    const requestedClass = req.params.class;
    const librarySubjects = fs.readdirSync(path.join(libraryFolder, requestedClass));
    res.send({subjects: librarySubjects});
})

router.post("/class/subject/add", checkAuth, async (req, res) => {
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const username = getSessionName(sessionCookie);
    const userClass = await getClass(username);
    const requestedClass = userClass.toString();
    
    const {subject} = req.body;
    if(!subject)
        return res.status(400).send({msg: "Subject name is required"})
    
    if(fs.existsSync(path.join(libraryFolder, requestedClass, subject)))
        return res.status(400).send({msg: "This subject already exists"})

    fs.mkdirSync(path.join(libraryFolder, requestedClass, subject));
    fs.writeFileSync(path.join(libraryFolder, requestedClass, subject, "index.json"), "[]");
    res.send({msg: "Subject created Successfully"})
})

router.get("/subject/:class", checkAuth, checkSubject, (req, res) => {
    const requestedClass = req.params.class;
    const requestedSubject = req.query.subject;
    const subjectFolder = path.join(libraryFolder, requestedClass, requestedSubject)
    res.sendFile(path.join(subjectFolder, "index.json"))
})

router.get("/material/:class/:file", checkAuth, checkSubject, (req, res) => {
    const requestedClass = req.params.class;
    const requestedSubject = req.query.subject;
    const subjectFolder = path.join(libraryFolder, requestedClass, requestedSubject)

    const requestedFile = req.params.file

    if(!fs.existsSync(path.join(subjectFolder, requestedFile)))
        return res.status(404).send({msg: "File not found"})

    res.sendFile(path.join(subjectFolder, requestedFile))
})

// const libraryDir = path.join(__dirname, "..", "saves", "library", "index.json");
// if (!fs.existsSync(libraryDir)) fs.mkdirSync(libraryDir);

// Define the storage options for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const lessonInfo = uploadMap.get(parseInt(req.params.id));
        
        cb(null, lessonInfo.location); // Set directory for file storage
    },
    filename: function (req, file, cb) {
        const lessonInfo = uploadMap.get(parseInt(req.params.id));
        cb(null, `${lessonInfo.id}${lessonInfo.count--}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, callback) => {
    file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8"); // Handle Arabic strings
    callback(null, true);
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Middleware to check authentication and validate request
function checkAuth(req, res, next) {
    if (!req.headers.cookie)
        return res.status(401).send({ msg: "No cookies provided" });
    
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    
    if (!exist) return res.status(401).send({ msg: "Not Authenticated" });
    next();
}

// how to make new lesson a7baby f allah

router.post("/subject/lesson/add", checkAuth, async(req, res) => {
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const username = getSessionName(sessionCookie);
    const userClass = await getClass(username); 
    const requestedClass = userClass.toString();

    console.log(req.body)

    const requestedSubject = req.body.subject;

    if(!requestedSubject)
        return res.status(400).send({msg: "Subject name is required"})

    const subjectFolder = path.join(libraryFolder, requestedClass, requestedSubject)
    console.log(subjectFolder)

    if(!fs.existsSync(subjectFolder))
        return res.status(404).send({msg: "This subject doesn't exist"});
    
    const { title, files } = req.body;
    if (!title) {
        return res.status(400).send({ msg: "Title is required in the request body" });
    }

    if (!files || typeof files !== 'number' || files < 1) {
        return res.status(400).send({ msg: "Number of files must be a positive integer" });
    }

    nextId++;

    const lesson = {
        Id: nextId,
        title: req.body.title,
        files: Array.from({ length: files }, (_, i) => `${nextId}${i}`), 
        date: Date.now()
    };

    uploadMap.set(nextId, {
        count: files,
        id: nextId,
        location: subjectFolder
    })

    const subjectIndex = path.join(libraryFolder, requestedClass, requestedSubject, "index.json");
    const subjectLessons = JSON.parse(fs.readFileSync(subjectIndex, "utf-8"));

    subjectLessons.unshift(lesson);
    fs.writeFileSync(subjectIndex, JSON.stringify(subjectLessons, null, 2)); 

    fs.writeFileSync(path.join(libraryFolder, "nextId.txt"), nextId.toString());

    res.status(201).send({ msg: "Lesson added successfully", id: nextId });
});


function getLesson(subjectFolder, lessonId) {
    const subjectIndex = path.join(subjectFolder, "index.json");
    const lessons = JSON.parse(fs.readFileSync(subjectIndex, "utf-8"));

    const requestedLesson = lessons.find((lesson) => lesson.Id === lessonId)

    return requestedLesson
}

router.post("/subject/lesson/markcancel", checkAuth, async(req, res) => {
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const username = getSessionName(sessionCookie);
    const userClass = await getClass(username); 
    const requestedClass = userClass.toString();

    console.log(req.body)

    const requestedSubject = req.body.subject;

    if(!requestedSubject)
        return res.status(400).send({msg: "Subject name is required"})

    const subjectFolder = path.join(libraryFolder, requestedClass, requestedSubject)
    console.log(subjectFolder)

    if(!fs.existsSync(subjectFolder))
        return res.status(404).send({msg: "This subject doesn't exist"});

    if(!req.body.lessonId)
        return res.status(400).send({msg: "You need to provide a lessonId"})

    const subjectIndex = path.join(libraryFolder, requestedClass, requestedSubject, "index.json");
    const subjectLessons = JSON.parse(fs.readFileSync(subjectIndex, "utf-8"));

    const requestedLesson = getLesson(subjectFolder, parseInt(req.body.lessonId));
    const lessonIndex = subjectLessons.findIndex(lsn => lsn.Id === requestedLesson.Id);

    if(requestedLesson) {
        requestedLesson.cancelled = true
        subjectLessons[lessonIndex] = requestedLesson
        fs.writeFileSync(subjectIndex, JSON.stringify(subjectLessons, null, 2));
        res.status(200).send({msg: "Lesson marked as cancelled"})
    }else{
        res.status(404).send({msg: "LessonId doesn't exist"})
    }

})

//Add new material to the lessons

function checkForAttachments(req, res, next) {
    const lessonId = parseInt(req.params.id);
    if(!uploadMap.has(lessonId))
        return res.status(403).send({msg: "Forbidden"})
    next();
}

// Route to add materials to an existing lesson
router.post("/subject/material/add/:id", checkForAttachments, checkAuth, upload.any("files"), async (req, res) => {
    try {
        const sessionCookie = getCookie(req.headers.cookie, "session");
        const username = getSessionName(sessionCookie);
        const userClass = await getClass(username);
        //// const requestedClass = userClass.toString();

        const lessonId = parseInt(req.params.id);
        if(!uploadMap.has(lessonId))
            return res.status(403).send({msg: "Forbidden"})

        const lessonInfo = uploadMap.get(lessonId)

        //// const requestedSubject = req..subject;

        // Validate request fields
        if (!req.files || req.files.length === 0) {
            return res.status(400).send({ msg: "No material files provided" });
        }

        // Load and update index.json with the new materials
        const subjectIndex = path.join(lessonInfo.location, "index.json");
        const lessons = JSON.parse(fs.readFileSync(subjectIndex, "utf-8"))

        // Get the latest lesson and update its files with the new materials
        const requestedLesson = getLesson(lessonInfo.location, lessonInfo.id) // Assuming the latest lesson is the first in the list
        const lessonIndex = lessons.findIndex(lsn => lsn.Id === requestedLesson.Id);

        const newFiles = req.files.map(file => file.filename); // Collect filenames of uploaded files
        lessons[lessonIndex].files = newFiles;
        uploadMap.delete(lessonId)
        
        // Write updated lesson data back to index.json
        fs.writeFileSync(subjectIndex, JSON.stringify(lessons, null, 2));
        
        res.status(201).send({ msg: "Materials added successfully to the lesson", files: newFiles });
    } catch (error) {
        console.error(error);
        res.status(500).send({ msg: "An error occurred", error: error.message });
    }
});

// library -> library/1 -> library/1/["arabic", "English", "etc..."] -> library/1/arabic/["index.json", "subject content"]

module.exports = router;