const fs = require("fs");
const path = require("path");

/**
 * @typedef {{author: string, date: number, content: string}} comment
 * @param {{content: string, author: string, date: number}} commentObj 
 * @param {string} postId 
 * @returns {comment[]}
 */
function saveComments(commentObj, postId) {
    const filePath = path.join(
        __dirname,
        "..",
        "saves/comments",
        `${postId}.json`
    );
    //check if exist or not?
    let comments = [];
    if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, "utf-8");
        comments = JSON.parse(fileData);
    }
    // Add the new comment
    comments.unshift({ ...commentObj });

    // Write the updated comments back to the file
    fs.writeFileSync(filePath, JSON.stringify(comments));

    return comments;
}

/**
 * 
 * @param {string} postId 
 * @param {string} newContent 
 * @param {number} date 
 * @returns {{msg?: string, error: string} | {msg: string, error?: string}}
 */
function updateComment(postId, newContent, date) {
    const filePath = path.join(
        __dirname,
        "..",
        "saves/comments",
        `${postId}.json`
    );

    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${postId}.json`);
        return { error: `Post with ID ${postId} does not exist` };
    }

    const fileData = fs.readFileSync(filePath, "utf-8");
    let comments = JSON.parse(fileData);

    const commentToEdit = comments.find((comment) => comment.date === date);
    //update the content

    commentToEdit.content = newContent;
    commentToEdit.editDate = Date.now();

    fs.writeFileSync(filePath, JSON.stringify(comments));
    return { msg: "Comment edited successfully" };
}

/**
 * 
 * @param {string} postId 
 * @param {number} date 
 * @returns {comment | undefined}
 */
function getComment(postId, date) {
    const filePath = path.join(
        __dirname,
        "..",
        "saves/comments",
        `${postId}.json`
    );

    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${postId}.json`);
        return undefined;
    }

    const fileData = fs.readFileSync(filePath, "utf-8");
    let comments = JSON.parse(fileData);

    const commentToSend = comments.find((comment) => comment.date === date);

    if (commentToSend) return commentToSend;
    else return undefined;
}

/**
 * 
 * @param {string} postId 
 * @param {number} date 
 * @returns {comment[] | {error: string}}
 */
function removeComments(postId, date) {
    const filePath = path.join(
        __dirname,
        "..",
        "saves/comments",
        `${postId}.json`
    );

    if (!fs.existsSync(filePath)) {
        return { error: "File does not exist" };
    }

    const fileData = fs.readFileSync(filePath, "utf-8");
    let comments = JSON.parse(fileData);

    const commentIndex = comments.findIndex(comment => comment.date === date );

    if (commentIndex !== -1) {

        comments.splice(commentIndex, 1);
        fs.writeFileSync(filePath, JSON.stringify(comments));
        return comments; 
    } else {
        return { error: "No comment found with the given date" };
    }
}
module.exports = {saveComments, updateComment, getComment, removeComments}