const router = require("express").Router();

const getCookie = require("../functions/getCookie");
const { getSession, getSessionName } = require("../functions/sessions");

const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { compressImg } = require("../functions/images");

const {
    saveComments,
    updateComment,
    getComment,
    removeComments,
} = require("../functions/comments");

// Define directories
const compressedPostsDir = path.join(
    __dirname,
    "..",
    "saves",
    "global",
    "SmallPosts"
);
if (!fs.existsSync(compressedPostsDir)) {
    fs.mkdirSync(compressedPostsDir);
}

const postsDir = path.join(__dirname, "..", "saves", "global", "posts");
if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir);

let nextId = parseInt(
    fs.readFileSync(path.join(__dirname, "..", "saves", "nextId.txt"), "utf-8")
);
/**
 * @typedef {{Id: string,postedAt: number,author: string,title: string,paragraph: string,attachments: string[]}} post
 * @type {post[]}
 */
let posts = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "saves", "posts.json"), "utf-8")
);

/**
 * @type {Map<string, string[]>}
 */
const namesMap = new Map();

/**
 * @type {Map<string, number>}
 */
const compressQueue = new Map();

router.get("/get", (req, res) => {
    if (!req.headers.cookie)
        return res.status(401).send({ msg: "No cookies provided" });
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (!exist) return res.status(401).send({ msg: "Not Authenticated" });

    res.send(posts);
});

router.get("/image/:image", (req, res) => {
    if (!req.headers.cookie)
        return res.status(401).send({ msg: "No cookies provided" });
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (!exist) return res.status(401).send({ msg: "Not Authenticated" });

    const imagePath = path.join(postsDir, req.params.image);

    if (!fs.existsSync(imagePath))
        return res.send({ msg: "Image doesn't exist" });
    res.sendFile(imagePath);
});

router.get("/image/small/:image", (req, res) => {
    if (!req.headers.cookie)
        return res.status(401).send({ msg: "No cookies provided" });
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (!exist) return res.status(401).send({ msg: "Not Authenticated" });

    const imagePath = path.join(compressedPostsDir, req.params.image);

    if (!fs.existsSync(imagePath))
        return res.send({ msg: "Image doesn't exist" });
    res.sendFile(imagePath);
});

function getPost(postId) {
    return posts.find((obj) => obj.Id === postId);
}

function savePosts() {
    fs.writeFileSync(
        path.join(__dirname, "..", "saves", "posts.json"),
        JSON.stringify(posts)
    );
}

// Define the storage options for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, postsDir); // Set the directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        cb(
            null,
            `${namesMap.get(req.params.postId).shift()}.${file.originalname
                .split(".")
                .at(-1)}`
        ); // Set the filename of the uploaded file
    },
});

const fileFilter = (req, file, callback) => {
    // fix problem can't save arabic strings
    file.originalname = Buffer.from(file.originalname, "latin1").toString(
        "utf8"
    );
    callback(null, true);
};

// Create a multer instance with the storage options
const upload = multer({ storage: storage, fileFilter: fileFilter });

function checkAuth(req, res, next) {
    if (!req.headers.cookie)
        return res.status(401).send({ msg: "No cookies provided" });
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (!exist) return res.status(401).send({ msg: "Not Authenticated" });
    if (!req.params.postId)
        return res.status(400).send({ msg: "postId is required" });
    if (!namesMap.has(req.params.postId))
        return res
            .status(400)
            .send({ msg: "This post doesn't have any attachments in it" });
    next();
}

router.post(
    "/attachment/upload/:postId",
    checkAuth,
    upload.any(),
    (req, res) => {
        console.log(
            req.files
                .map(
                    (file) =>
                        `Receiving file ${file.filename}\nsize: ${file.size}\nsaved in: ${file.destination}\nsaved as: ${file.path}`
                )
                .join("\n")
        );

        const postId = req.params.postId;
        const post = getPost(postId);
        // console.log(post);

        // console.log("Files received");
        for (let i = 0; i < post.attachments.length; i++) {
            post.attachments[i] = req.files[i].filename;

            // Compress the image after it is saved
            const inputFile = path.join(postsDir, req.files[i].filename);
            // console.log("renaming compressing files");
            const outputFile = path.join(
                compressedPostsDir,
                req.files[i].filename
            );
            compressImg(inputFile, outputFile, postId, res);
        }
    }
);

globalEvents.on("compressDone", (postId, res) => {
    console.log(`file compressd ${postId}`);
    if (compressQueue.has(postId)) {
        let queueItems = compressQueue.get(postId);
        queueItems--;
        compressQueue.set(postId, queueItems);
    }
    if (namesMap.has(postId))
        if (compressQueue.get(postId) === 0) closePostUpload(postId, res);
});

function closePostUpload(postId, res) {
    // console.log(`response sent ${postId}`);
    namesMap.delete(postId);
    compressQueue.delete(postId);
    savePosts();
    return res.send("Files uploaded successfully.");
}

router.post("/add", (req, res) => {
    if (!req.headers.cookie)
        return res.status(401).send({ msg: "No cookies provided" });
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (!exist) return res.status(401).send({ msg: "Not Authenticated" });

    if (!req.body.title)
        return res.status(400).send({ msg: "post title required" });

    const postId = nextId;
    const postedAt = Date.now();
    const expirationTime = postedAt + 3 * 60 * 60 * 1000;

    const postObject = {
        Id: postId.toString(),
        postedAt: postedAt,
        expiresAt: expirationTime,
        author: getSessionName(sessionCookie),
        title: req.body.title,
    };

    if (req.body.paragraph) {
        postObject["paragraph"] = req.body.paragraph;
    }

    if (req.body.attachments) {
        postObject["attachments"] = [];
        namesMap.set(postId.toString(), []);
        for (let i = 0; i < req.body.attachments; i++) {
            postObject["attachments"].push(`${postId}${i + 1}`);
            namesMap.get(postId.toString()).push(`${postId}${i + 1}`);
            compressQueue.set(postId.toString(), req.body.attachments);
        }
    }

    posts.unshift(postObject);

    nextId++;
    fs.writeFileSync(
        path.join(__dirname, "..", "saves", "nextId.txt"),
        nextId.toString()
    );
    savePosts();

    res.send({ msg: "post created successfully", postId: postId });
});

// route to  edit the posts

router.post("/edit/:postId", (req, res) => {
    if (!req.headers.cookie) {
        return res.status(401).send({ msg: "No cookies provided" });
    }

    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (!exist) return res.status(401).send({ msg: "Not Authenticated" });

    const postId = req.params.postId;
    const { title, paragraph } = req.body;

    const postToEdit = getPost(postId);

    if (!postToEdit) {
        return res.status(404).send({ msg: "Post not found" });
    }

    const author = getSessionName(sessionCookie);
    const currentTime = Date.now();

    if (postToEdit.author !== author) {
        return res
            .status(403)
            .send({ msg: "You are not authorized to edit this post" });
    }

    const threeHours = 3 * 60 * 60 * 1000;
    if (currentTime > postToEdit.postedAt + threeHours) {
        return res.status(403).send({
            msg: "Edit time expired. You can no longer edit this post.",
        });
    }

    if (title && title !== "") postToEdit.title = title;
    if (paragraph && paragraph !== "") postToEdit.paragraph = paragraph;
    // if (attachment) postToEdit.attachments = attachment;

    savePosts();

    res.status(200).send({ msg: "Post edited successfully", postId: postId });
});

/**
 *
 * @param {post} postToRemove
 */
function removePost(postToRemove) {
    const postIndex = posts.indexOf(postToRemove);
    try {
        posts.splice(postIndex, 1);
        savePosts();
        return { success: true };
    } catch {
        return { error: "An error happened while deleting the post" };
    }
}

// route to remove the posts
router.post("/remove/:postId", (req, res) => {
    if (!req.headers.cookie) {
        return res.status(401).send({ msg: "No cookies provided" });
    }

    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (!exist) return res.status(401).send({ msg: "Not Authenticated" });

    const postId = req.params.postId;
    const author = getSessionName(sessionCookie);

    const postToRemove = getPost(postId);
    // console.log(postToRemove)
    if (!postToRemove) {
        return res.status(400).send({ msg: "Post not found" });
    }

    if (postToRemove.author !== author) {
        return res
            .status(403)
            .send({ msg: "Unauthorized to remove this post" });
    }

    const result = removePost(postToRemove);

    if (result.error) return res.status(400).send({ msg: result.error });

    res.status(200).send({
        msg: `Post with ID ${postId} was successfully removed`,
    });
});

router.post("/search", (req, res) => {
    if (!req.headers.cookie)
        return res.status(401).send({ msg: "No cookies provided" });
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (!exist) return res.status(401).send({ msg: "Not Authenticated" });

    if (!req.body.title)
        return res.status(400).send({ msg: "post title required" });

    let searched = [];

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        if (post.title.toLowerCase().includes(req.body.title.toLowerCase())) {
            searched.push(post);
        }
    }

    res.send(searched);
});

router.get("/get/:start/:amount", (req, res) => {
    if (!req.headers.cookie)
        return res.status(401).send({ msg: "No cookies provided" });
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (!exist) return res.status(401).send({ msg: "Not Authenticated" });

    if (!req.params.start || !req.params.amount)
        return res
            .status(401)
            .send({ msg: "The start and end have to be provided" });
    if (isNaN(req.params.start) || isNaN(req.params.amount))
        return res
            .status(401)
            .send({ msg: "The start and end have to be numbers" });

    const start = parseInt(req.params.start);
    const end = parseInt(req.params.amount);
    const sendPosts = posts.slice(start, start + end);
    res.send(sendPosts);
});

//rout to add comment
router.post("/comment/add/:postId", (req, res) => {
    if (!req.headers.cookie)
        return res.status(401).send({ msg: "No cookies provided" });

    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (!exist) return res.status(401).send({ msg: "Not Authenticated" });

    if (!req.body.content)
        return res.status(400).send({ msg: "Content is required" });

    const { postId } = req.params;
    if (!postId) {
        return res.status(400).send({ msg: "postId is required" });
    }

    const postInQuestion = getPost(postId);
    if (!postInQuestion)
        return res.status(400).send({ msg: "This post doesn't exist" });

    const commentObj = {
        author: getSessionName(sessionCookie),
        date: Date.now(),
        content: req.body.content,
    };

    saveComments(commentObj, postId);

    res.send({ msg: "comment created successfully" });
});

// rout to edit comment
router.post("/comment/edit/:postId", (req, res) => {
    if (!req.headers.cookie) {
        return res.status(401).send({ msg: "No cookies provided" });
    }

    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (!exist) return res.status(401).send({ msg: "Not Authenticated" });

    const { content, date } = req.body;

    if (!content)
        return res.status(400).send({ msg: "New content is required" });

    if (!date)
        return res.status(400).send({ msg: "Comment post date is required" });

    const postId = req.params.postId;

    const author = getSessionName(sessionCookie);
    const commentToEdit = getComment(postId, date);

    if (!commentToEdit)
        return res.status(403).send({ msg: "اصاحب انت بتعمل ايه؟" });

    if (commentToEdit.author !== author)
        return res.status(403).send({ msg: "حرامي😂😂" });

    const updateMessage = updateComment(postId, content, date);

    if (updateMessage.error)
        return res.status(400).send({ msg: updateMessage.error });

    res.send({ msg: updateMessage.msg });
});

// rout to remove comments
router.post("/comment/remove/:postId", (req, res) => {
    if (!req.headers.cookie) {
        return res.status(401).send({ msg: "No cookies provided" });
    }

    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (!exist) return res.status(401).send({ msg: "Not Authenticated" });

    const postId = req.params.postId;
    const date = req.body.date;

    if (!date) {
        return res.status(400).send({ msg: "Comment post date is required" });
    }

    const commentToEdit = getComment(postId, date);

    if (!commentToEdit) {
        return res.status(404).send({ msg: "Comment not found" });
    }

    const author = getSessionName(sessionCookie);

    if (commentToEdit.author !== author) {
        return res
            .status(403)
            .send({ msg: "You are not authorized to remove this comment" });
    }

    const result = removeComments(postId, date);

    if (result.error) {
        return res.status(400).send({ msg: result.error });
    }

    res.status(200).send({ msg: `Removed the comment from post ID ${postId}` });
});

// router to get comments
router.get("/comment/get/:postId/:start/:amount", (req, res) => {
    if (!req.headers.cookie) {
        return res.status(401).json({ msg: "No cookies provided" });
    }

    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (!exist) return res.status(401).json({ msg: "Not Authenticated" });

    const starting = req.params.start;
    const amounting = req.params.amount;
    const postId = req.params.postId;

    if (!starting || !amounting || !postId) {
        return res
            .status(400)
            .json({ msg: "Please provide start, amount, and postId." });
    }

    if (isNaN(starting) || isNaN(amounting) || isNaN(postId)) {
        return res
            .status(400)
            .json({ msg: "Start, amount, and postId must be numbers." });
    }

    const start = parseInt(starting);
    const amount = parseInt(amounting);
    const idOfPost = parseInt(postId);

    const filePath = path.join(
        __dirname,
        "..",
        "saves",
        "comments",
        `${idOfPost}.json`
    );

    if (!fs.existsSync(filePath)) {
        return res
            .status(400)
            .send({ msg: `No comments found for post ID ${idOfPost}` });
    }

    const fileData = fs.readFileSync(filePath, "utf-8");
    const comments = JSON.parse(fileData);

    // from tommy code
    const sendComments = comments.slice(start, start + amount);

    if (sendComments.length === 0) {
        return res
            .status(400)
            .send({ msg: "No comments available in the requested range." });
    }

    res.status(200).json(sendComments);
});

module.exports = router;
