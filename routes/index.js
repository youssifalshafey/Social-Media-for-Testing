const router = require("express").Router();
const path = require("path");

const getCookie = require("../functions/getCookie");
const { getSession, getSessionName } = require("../functions/sessions");

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

router.get("/forget", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "forgetForm.html"))
})

router.get("/home", (req, res) => {
    if (!req.headers.cookie) return res.redirect("/login");
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (exist) {
        res.sendFile(path.join(__dirname, "..", "views", "home.html"));
    } else {
        res.redirect("/login");
    }
});
   
// router.get("/reset", (req, res) => {
//     res.sendFile(path.join(__dirname, "..", "views", "forget.html"))
// })

router.get("/library", (req, res) => {
    if (!req.headers.cookie) return res.redirect("/login");
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (exist) {
        res.sendFile(path.join(__dirname, "..", "views", "library.html"));
    } else {
        res.redirect("/login");
    }
});

router.get("/login", (req, res) => {
    if (!req.headers.cookie)
        return res.sendFile(path.join(__dirname, "..", "views", "login.html"));
    const sessionCookie = getCookie(req.headers.cookie, "session");
    const exist = getSession(sessionCookie);
    if (!exist) {
        res.sendFile(path.join(__dirname, "..", "views", "login.html"));
    } else {
        res.redirect("/home");
    }
});

router.get("/chat", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "chat.html"));
});

router.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "about.html"));
});

router.get("/school", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "school.html"));
});
router.get("/team", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "team.html"));
});

const api = require("./api");
router.use("/api", api);

const posts = require("./posts");
router.use("/posts", posts);

const info = require('./info');
router.use('/info', info)

const library = require('./library');
router.use('/library', library)

const admins = require('./admins');
router.use('/admins', admins)

router.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "..", "views", "404.html"));
});


module.exports = router;
