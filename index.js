//This index file is as it says just an index to tell node where everything is and how to use it
require("dotenv").config();
 
const express = require("express");
const app = express();
// to get the user Name 
const cookies = require('./functions/getCookie');
const {getSessionName, getSession} = require('./functions/sessions');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const EventEmitter = require('events');
global.globalEvents = new EventEmitter();

//this line makes that any file in the public folder is public to everyone even users
//put js and css files here and the server will handle the rest
//the html files should be put inside of the views folder according to their respective routes
//this is to create order
app.use(express.static('public'));

const routes = require("./routes");
app.use("/", routes);

//we are gonna have to initialize an http server and socket io for real time communications
//yeah i know it's weird
//here we initialize the http server with the express app as the host
const http = require('http');
const server = http.createServer(app);
const {
    Server
} = require("socket.io");

//we make a new socket.io server with out http server as the host
const io = new Server(server);

io.on("connection", socket => {
    console.log(`${socket.id} just connected`);

    if(!socket.handshake.headers.cookie) return socket.disconnect(true).send("Not permitted here");
    const userCookie = cookies(socket.handshake.headers.cookie, "session")
    if(!userCookie) return socket.disconnect(true).send("Not permitted here");
    if(!getSession(userCookie)) return socket.disconnect(true).send("Not permitted here");

    // Get the username from session cookies
    const userNameFromSessions = socket.handshake.headers.cookie 
        ? cookies(socket.handshake.headers.cookie, 'session') 
        : null;

    // Check if the username exists
    if (userNameFromSessions) {
        const userName = getSessionName(userNameFromSessions);
        
        if (userName) {
            socket.emit('user-name', userName);
            console.log(`UserName for ${socket.id}: ${userName}`);

            // Listen for user input
            socket.on('user-input', (msg) => {
                if (msg) {
                    console.log(`The message sent successfully: ${msg}`);
                    // Broadcast the message to all users
                    io.emit('receive-message', userName, msg);
                }
            });

            // Handle user disconnection
            socket.on("disconnect", () => {
                console.log(`${userName} has disconnected`);
                io.emit('disconnect-msg', `${userName} has left the chat.`);
            });
        }
    } else {
        console.log('User name not found in session.');
    }
});

const port = process.env.PORT;

server.listen(port, () => {
    console.log(`listening on port ${port}`)
})

server.on("error", async (err) => {
    console.error(err);
})
