const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const accountsFolder = path.join(__dirname, '..', 'saves', 'accounts');

function checkaccount(body) {
    const username = body.username;
    const password = body.password;

    // const accounts = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "saves", "pairs.json"), "utf-8"));

    try {
        const account = fs.readFileSync(
            path.join(accountsFolder, `${username}.json`),
            'utf-8',
        );

        if (account) {
            const info = JSON.parse(account);
            if(info.username === username)
                return bcrypt.compareSync(password, info.password);
            else
                return false
        }
        return false;
    } catch {
        return false;
    }
}

async function changePassword(body) {
    const username = body.username;
    const password = body.password;
    const newpassword = body.newpassword;

    const account = JSON.parse(
        fs.readFileSync(path.join(accountsFolder, `${username}.json`), 'utf-8'),
    );

    // const accounts = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "saves", "pairs.json"), "utf-8"));
    if (account && bcrypt.compareSync(password, account.password)) {
        const salt = await bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hashSync(newpassword, salt);
        account.password = hashedPassword;
        fs.writeFileSync(
            path.join(accountsFolder, `${username}.json`),
            JSON.stringify(account),
        );
        return true;
    }
    return false;
}

async function resetPassword(username, password) {
    const account = JSON.parse(
        fs.readFileSync(path.join(accountsFolder, `${username}.json`), 'utf-8'),
    );

    const salt = await bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);
    account.password = hashedPassword;
    fs.writeFileSync(
        path.join(accountsFolder, `${username}.json`),
        JSON.stringify(account),
    );
    return true
}

function checkaccountByUsername(body) {
    const username = body.username;

    const accounts = fs.readdirSync(accountsFolder);

    // const accounts = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "saves", "pairs.json"), "utf-8"));
    if (accounts.includes(`${username}.json`)) return true;
    return false;
}

function checkEmail(email) {
    // const accounts = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "saves", "pairs.json"), "utf-8"));

    const emails = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, '..', 'saves', 'emails.json'),
            'utf-8',
        ),
    );

    // for (let i = 0; i < Object.keys(accounts).length; i++) {
    //     const user = Object.keys(accounts)[i];
    //     console.log(accounts[user])
    //     if(accounts[user].email.toLowerCase() !== email.toLowerCase()) continue;
    //     return user;
    // }

    if (emails[email]) {
        const account = JSON.parse(
            fs.readFileSync(
                path.join(accountsFolder, `${emails[email]}.json`),
                'utf-8',
            ),
        );
        return account;
    }

    return '';
}

// read excell sheet without root a7baby f allah

// first make the libraryes
const filePath = path.join(__dirname);

module.exports = {
    checkaccount,
    changePassword,
    checkaccountByUsername,
    checkEmail,
    resetPassword
};
