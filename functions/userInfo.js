const fs = require("fs").promises; // Use promises for asynchronous file operations
const path = require("path");

// const dataFilePath = path.join(__dirname, "..", "saves", "pairs.json");
const accountsFolder = path.join(__dirname, "..", "saves", "accounts");

async function readAccount(username) {
    try {
        const data = await fs.readFile(path.join(accountsFolder, `${username}.json`), "utf-8");
        return JSON.parse(data);
    } catch (error) {
        // console.error("Error reading user data:", error);
        return undefined
    }
}

async function getImage(username) {
    const account = await readAccount(username);
    return account?.image || "default.png";
}

async function getBio(username) {
    const account = await readAccount(username);
    return account?.info || "no info";
}

async function getPublicInfo(username) {
    const user = await readAccount(username);

    if (!user) {
        return {error: "This user doesn't exist"}
    }

    return {
        info: user.info || "no info",
        class: user.class || 1,
        image: user.image || "default.png",
        role: user.role || "student"
    };
}

async function checkAdmin(username){
    const user = await readAccount(username);
    try{
        if (user){
            console.log(user.role === "admin");
            return user.role === 'admin';
        } 
    }catch(err){
        console.error('You Are Not the Admin');
        return err.message
    }
}

async function updateBio(username, bio) {
    const user = await readAccount(username);
    user.info = bio;

    await fs.writeFile(path.join(accountsFolder, `${username}.json`), JSON.stringify(user));
}

async function getFullInfo(username) {
    const userInfo = await readAccount(username);

    delete userInfo.password; // Exclude password
    return userInfo;
}

async function setUserImage(username, image) {
    const userInfo = await readAccount(username);

    userInfo["image"] = image;

    await fs.writeFile(path.join(accountsFolder, `${username}.json`), JSON.stringify(userInfo));
}

async function getClass(username) {
    const userInfo = await readAccount(username);

    return userInfo.class;
}

module.exports = { getImage, getBio, getPublicInfo, getFullInfo, setUserImage, updateBio, getClass, checkAdmin};
