const router = require("express").Router();

const multer = require("multer");
const { getSession, getSessionName } = require("../functions/sessions");
const {
    getImage,
    getBio,
    getPublicInfo,
    getFullInfo,
    setUserImage,
    updateBio
} = require("../functions/userInfo");
const path = require("path");
const fs = require("fs");
const { compressUserImage } = require("../functions/images");
const getCookie = require("../functions/getCookie");

// Define directories
const outputDir = path.join(__dirname, "..", "userImages");
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const compressedImagesDir = path.join(
    __dirname,
    "..",
    "userImages",
    "compressed"
);
if (!fs.existsSync(compressedImagesDir)) {
    fs.mkdirSync(compressedImagesDir);
}

const FullResImagesDir = path.join(__dirname, "..", "userImages", "full");
if (!fs.existsSync(FullResImagesDir)) {
    fs.mkdirSync(FullResImagesDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, FullResImagesDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save file with unique name
    },
});

// File filter for image uploads
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb("Invalid file type. Only JPEG and PNG files are allowed.", false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

router.get("/image/:userId", checkAuth, async (req, res) => {
    const userId = req.params.userId;
    const userInfo = await getImage(userId);
    if(!userInfo.error) {
        res.status(200).send(userInfo);
    } else {
        res.status(404).send({ msg: userInfo.error });
    }
});

router.get("/bio/:userId", checkAuth, async (req, res) => {
    const userId = req.params.userId;
    const userInfo = await getBio(userId);
    if(userInfo === "defaule.png") {
        res.status(200).send(userInfo);
    } else {
        res.status(404).send({ msg: "no img" });
    }
});

// Route: Get public user info
router.get("/publicInfo/:userId", checkAuth, async (req, res) => {
    const userId = req.params.userId;
    const userInfo = await getPublicInfo(userId);
    if(!userInfo.error) {
        res.status(200).send(userInfo);
    } else {
        res.status(404).send({ msg: userInfo.error });
    }
});

// Route: Get full user info (requires session check)
router.get("/fullInfo", async (req, res) => {
    if (!req.headers.cookie)
        return res.status(401).send({ msg: "No cookies provided" });
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const session = getSession(sessionCookie);
    if (session) {
        const username = getSessionName(sessionCookie);
        const userInfo = await getFullInfo(username);
        
        res.status(200).send(userInfo);
    } else {
        res.status(401).send({ msg: "Unauthorized" });
    }
});

function checkAuth(req, res, next) {
    if (!req.headers.cookie)
        return res.status(401).send({ msg: "No cookies provided" });
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (!exist) return res.status(401).send({ msg: "Not Authenticated" });
    next();
}

// Route: Upload user image
router.post(
    "/uploadImage",
    checkAuth,
    upload.single("photo"),
    async (req, res) => {
        const file = req.file; // to get the file (photo)
        const sessionCookie = getCookie(req.headers.cookie, "session");
        // console.log(file);
        if (!file) {
            return res.status(400).send({ msg: "No file uploaded" });
        }

        try {
            const inputPath = file.path;
            const outputPath = path.join(compressedImagesDir, file.filename);
            // comopressed !
            await compressUserImage(inputPath, outputPath);

            await setUserImage(getSessionName(sessionCookie), file.filename)

            res.send({ msg: "Image uploaded successfully", image: file.filename });
        } catch (error) {
            res.status(500).json({
                msg: "Error processing image",
                error: error.message,
            });
        }
    }
);

router.post("/update/bio", checkAuth, async(req,res)=>{
    const bio = req.body.bio;
    const userSession = getCookie(req.headers.cookie, "session");
    const username = getSessionName(userSession)
    await updateBio(username, bio);
    res.status(200).send({msg: "bio updated successfully"})
})

router.get("/getimage/full/:imageId", checkAuth, async (req, res) => {
    const imageId = req.params.imageId;
    if(fs.existsSync(path.join(FullResImagesDir, imageId)))
        res.sendFile(path.join(FullResImagesDir, imageId))
    else
        res.status(400).send({msg: "This image doesn't exist"});
})

router.get("/getimage/low/:imageId", checkAuth, async (req, res) => {
    const imageId = req.params.imageId;
    if(fs.existsSync(path.join(compressedImagesDir, imageId)))
        res.sendFile(path.join(compressedImagesDir, imageId))
    else
        res.status(400).send({msg: "This image doesn't exist"});
})

module.exports = router;
