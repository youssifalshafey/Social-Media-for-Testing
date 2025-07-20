const router = require('express').Router();

const {
    checkaccount,
    changePassword,
    checkaccountByUsername,
    checkEmail,
    resetPassword,
} = require('../functions/accounts');
const getCookie = require('../functions/getCookie');
const {
    getSession,
    makeSession,
    removeSession,
    getSessionName,
} = require('../functions/sessions');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const cheerio = require('cheerio');

const nodemailer = require('nodemailer');

const config = require('../saves/serverConfig.json');
const resetCodesMap = new Map();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'projectel033@gmail.com',
        pass: 'xcen bvsf xmnr oski',
    },
});

const accountsFolder = path.join(__dirname, '..', 'saves', 'accounts');
const emailsFile = path.join(__dirname, '..', 'saves', 'emails.json');

if (!fs.existsSync(accountsFolder)) fs.mkdirSync(accountsFolder);
if (!fs.existsSync(emailsFile)) fs.writeFileSync(emailsFile, '{}');

router.post('/register', async (req, res) => {
    const exist = checkaccountByUsername(req.body);
    if (exist) {
        return res.status(400).send({ msg: 'The account already exists' });
    } else {
        // const accountFiles = fs.readdirSync(accountsFolder)
        // const accountFile = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "saves", "pairs.json"), "utf-8"));
        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;
        const userClass = req.body.class;
        const role = req.body.role;

        if (!username || !password || !email)
            return res
                .status(400)
                .send({ msg: 'The username, email and password are required' });

        const salt = await bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hashSync(password, salt);

        const newAccount = {
            password: hashedPassword,
            email,
            username,
        };

        if (!userClass) {
            newAccount.class = 1;
        }

        if (!role) {
            newAccount.role = 'student';
        }
        // accountFile[username] = newAccount;

        const emails = JSON.parse(fs.readFileSync(emailsFile, 'utf-8'));
        emails[email] = username;

        fs.writeFileSync(emailsFile, JSON.stringify(emails));
        fs.writeFileSync(
            path.join(accountsFolder, `${username}.json`),
            JSON.stringify(newAccount),
        );

        // fs.writeFileSync(path.join(__dirname, "..", "saves", "pairs.json"), JSON.stringify(accountFile));
        res.status(200).send({ msg: 'The account has been created' });
    }
});

router.post('/login', (req, res) => {
    const exist = checkaccount(req.body);
    if (exist) {
        if (req.headers.cookie) {
            const sessionCookie = getCookie(req.headers.cookie, 'session');
            const loggedIn = getSession(sessionCookie);
            if (loggedIn) {
                return res.status(200).send({ msg: 'Authorised' });
            }
        }

        const sessionToken = makeSession(req.body.username, req.body.remember);

        if (req.body.remember)
            res.status(200)
                .cookie('session', sessionToken, {
                    maxAge: 2629800000,
                })
                .send({ msg: 'Authorised' });
        else
            res.status(200)
                .cookie('session', sessionToken)
                .send({ msg: 'Authorised' });
    } else
        res.status(401).send({
            msg: "Account doesn't exist or the password is wrong",
            exist,
        });
});

router.get('/check', (req, res) => {
    if (!req.headers.cookie)
        return res.status(401).send({
            msg: "Account doesn't exist or the sessionToken is wrong",
        });
    const sessionCookie = getCookie(req.headers.cookie, 'session');
    const loggedIn = getSession(sessionCookie);
    if (loggedIn) {
        res.status(200).send({
            msg: 'authorised',
            username: getSessionName(sessionCookie),
        });
    } else {
        res.status(401).send({
            msg: "Account doesn't exist or the sessionToken is wrong",
        });
    }
});

router.post('/changepassword', (req, res) => {
    if (!req.headers.cookie)
        return res.status(401).send({ msg: 'No cookies provided' });
    const sessionCookie = getCookie(req.headers.cookie, 'session');
    const exist = getSession(sessionCookie);
    if (!exist) return res.status(401).send({ msg: 'Not Authenticated' });

    if (!req.body.password || !req.body.newpassword)
        return res
            .status(400)
            .send({ msg: 'Invalid request no password or new password' });

    const username = getSessionName(sessionCookie);
    req.body.username = username;
    const passwordExist = checkaccount(req.body);
    if (passwordExist) {
        const changed = changePassword(req.body);
        if (changed) res.send({ msg: 'password changed' });
        else
            res.status(400).send({
                msg: 'maybe you provided a wrong password',
            });
    } else res.status(400).send({ msg: 'maybe you provided a wrong password' });
});

router.post('/forget', (req, res) => {
    const usermail = req.body.mail;
    console.log(usermail);
    if (!usermail || usermail === '')
        return res.status(400).send({ msg: 'The email is required' });

    const username = checkEmail(usermail.trim()).username;
    if (!username || username === '')
        return res.status(400).send({ msg: "The email doesn't exist" });

    const makeRadomCode = (length) => {
        const letters = [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
            'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
            'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a',
            'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
            'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
            't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2',
            '3', '4', '5', '6', '7', '8', '9', '0'
        ];

        let radomCode = '';
        for (let i = 0; i < length; i++) {
            radomCode += letters[parseInt(Math.random() * letters.length)];
        }

        return radomCode;
    };

    const code = makeRadomCode(200);
    resetCodesMap.set(code, username);

    let mailOptions = {
        from: 'projectel033@gmail.com',
        to: usermail,
        subject: 'Password reset for STG',
        text: `hello, you seem to have requested that your password be reset\nIf it was you who sent the request click the link below\n${config.protocol}://${config.host}${config.port ? `:${config.port}` : ''}/api/resetpass/${code}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
    res.send({ msg: "The email has been sent" });
    // res.send({
    //     msg: `${config.protocol}://${config.host}${config.port ? `:${config.port}` : ''}/api/resetpass/${code}`,
    // });

    setTimeout(() => {
        if (resetCodesMap.has(code)) resetCodesMap.delete(code);
    }, 1800000);
});

let $ = cheerio.load(
    fs.readFileSync(path.join(__dirname, '..', 'views', 'forget.html')),
);

router.get('/resetpass/:code', (req, res) => {
    const { code } = req.params;
    if (!resetCodesMap.has(code))
        return res.status(402).send('This code is invalid or has expired');
    
    // res.sendFile(path.join(__dirname, "..", "views", "forget.html"))
    // res.send({msg: "password reset ongoing or sth"})
    $('#title').text(`Password reset for ${resetCodesMap.get(code)}`);
    $('script').html(`
        const input1 = document.getElementById("input1");
        const input2 = document.getElementById("input2");
        const resetForm = document.getElementById("resetForm");
        const errorHolder = document.getElementById("error");

        const resetCode = "${code}";

        // console.log(input1, input2, resetCode)

        resetForm.onsubmit = (ev) => {
            ev.preventDefault();
            if(input1.value === input2.value){
            if(input1.value.length < 6)
                return errorHolder.innerText = "password must be 6 characters or more"

                fetch(\`/api/resetpass/\$\{resetCode\}\`, {
                    credentials: "same-origin",
                    headers: {
                        "content-type": "Application/json",
                    },
                    method: "POST",
                    body: JSON.stringify({
                        password: input1.value
                    })
                }).then(res => {
                    if(res.ok) {
                        window.location.href = "/login"
                    }
                })
            }else{
                errorHolder.innerText = "The password doesn't match"
            }
            
        }`);
    res.send($.html());
});

router.post('/resetpass/:code', (req, res) => {
    const { code } = req.params;
    if (!resetCodesMap.has(code))
        return res.status(402).send({msg: 'This code is invalid or has expired'});

    const passowrd = req.body.password;
    if (!passowrd || passowrd.length < 6)
        return res
            .status(400)
            .send({ msg: 'The password must be loger than 6 characters' });

    const accountName = resetCodesMap.get(code);
    const reset = resetPassword(accountName, passowrd);
    if(reset){
        resetCodesMap.delete(code)
        res.send({msg: "Password reset successful"})
    }
});

router.get('/logout', (req, res) => {
    if (!req.headers.cookie)
        return res.status(400).send({ msg: 'Cookies are required to logout' });
    const sessionCookie = getCookie(req.headers.cookie, 'session');
    const loggedOut = removeSession(sessionCookie);
    if (loggedOut)
        res.cookie('session', '', {
            maxAge: 0,
        }).send({ msg: 'LoggedOut' });
    else res.status(400).send({ msg: 'token not provided' });
});

module.exports = router;
