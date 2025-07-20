const fs = require("fs");
const path = require("path");
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

    let radomCode = "";
    for (let i = 0; i < length; i++) {
        radomCode += letters[parseInt(Math.random() * letters.length)];
    }

    return radomCode;
}

if (!fs.existsSync(path.join(__dirname, "..", "saves"))) {
    fs.mkdirSync(path.join(__dirname, "..", "saves"));
}

const sessionsPath = path.join(__dirname, "..", "saves", "sessions.json");
if (!fs.existsSync(sessionsPath)) fs.writeFileSync(sessionsPath, JSON.stringify({}));

fs.readFile(sessionsPath, "utf-8", (err, data) => {
    if (err) return console.error(err)
    const sessions = JSON.parse(data);
    for (const key in sessions) {
        const session = sessions[key];
        if ((session.date - Date.now()) + session.expires < 0) {
            delete sessions[key];
        }
    }
    fs.writeFileSync(sessionsPath, JSON.stringify(sessions));
})

/**
 * 
 * @param {string} username 
 * @param {boolean} remember 
 */
function makeSession(username, remember) {
    const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf-8"));
    const sessionToken = makeRadomCode(Math.floor(Math.floor(Math.random() * (300 - 200 + 1)) + 200));
    sessions[sessionToken] = {
        name: username,
        date: Date.now(),
        expires: remember ? 2629800000 : 0
    }
    fs.writeFileSync(sessionsPath, JSON.stringify(sessions));
    return sessionToken;
}

/**
 * @param {string} sessionToken 
 */
function getSession(sessionToken) {
    const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf-8"));
    if (sessions[sessionToken])
        return true
    else
        return false
}

/**
 * @param {string} sessionToken 
 * @returns {string | null} 
 */
function getSessionName(sessionToken) {
    const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf-8"));
    if (sessions[sessionToken])
        return sessions[sessionToken].name
    else
        return null
}

/**
 * @param {string} sessionToken 
 */
function removeSession(sessionToken) {
    const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf-8"));
    if (sessions[sessionToken] ) {
        console.log(`${sessions[sessionToken].name} just logged out!`);
        delete sessions[sessionToken];
        fs.writeFileSync(sessionsPath, JSON.stringify(sessions));
        return true;
    } else {
        return false;
    }
}

module.exports = { makeSession, getSession, removeSession, getSessionName };