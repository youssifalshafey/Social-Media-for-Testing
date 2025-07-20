const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const getCookie = require('../functions/getCookie');
const { getSession, getSessionName } = require('../functions/sessions');
const csv = require('csv-parser');
const path = require('path');
const fs = require('fs');
const { checkAdmin } = require('../functions/userInfo');
const { Parser } = require('json2csv');

// Function to generate random passwords
function generatePassword(length = 6 ) {
    const chars =
        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(chars.length-1);
        password += chars[randomIndex];
    }
    return password;
}

const excellFolder = path.join(__dirname, '..', 'saves', 'ExcellFiles');
const emailsFile = path.join(__dirname, '..', 'saves', 'emails.json'); 
const studentFolder = path.join(__dirname, '..', 'saves', 'accounts');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(excellFolder)) {
            console.log('Directory does not exist. Creating directory...');
            fs.mkdirSync(excellFolder, { recursive: true });
        }
        cb(null, excellFolder);
    },
    filename: (req, file, cb) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        console.log(`Storing file as: ${fileName}`);
        cb(null, fileName);
    },
});

const upload = multer({ storage: storage });



async function adminMiddleware(req, res, next) {
    const sessionCookie = getCookie(req.headers.cookie, 'session');
    const exist = getSession(sessionCookie);

    if (exist) {
        const username = getSessionName(sessionCookie);
        const isAdmin = await checkAdmin(username);

        if (isAdmin) {
            console.log(`User ${username} is an admin`);
            next();
        } else {
            return res.status(403).json({ msg: 'Admins only' });
        }
    } else {
        return res.status(401).json({ msg: 'Session not found' });
    }
}


async function processCSV(filePath) {
    console.log(`Processing CSV file: ${filePath}`);
    return new Promise((resolve, reject) => {
        const csvData = [];
        let isEmpty = true;

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                isEmpty = false;
                console.log(`Data row: ${JSON.stringify(data)}`);
                csvData.push(data);
            })
            .on('end', () => {
                fs.unlinkSync(filePath); 
                console.log(`CSV file processed successfully`);
                if (isEmpty) {
                    return reject('The file is empty.');
                }

                csvData.forEach((row) => {
                    if (row) {
                        row.class = row.class || '1';
                    }
                });

                resolve(csvData);
            })
            .on('error', (err) => {
                console.error(`Error processing file: ${err.message}`);
                reject(err);
            });
    });
}

router.post(
    '/accounts',
    adminMiddleware,
    upload.single('file'),
    async (req, res) => {
        console.log('Route /admins/accounts accessed');

        const filePath = req.file?.path;
        if (!filePath) {
            return res.status(400).json({ msg: 'No file provided' });
        }

        console.log('File uploaded successfully:', req.file);

        try {
            const filesInFolder = fs.readdirSync(excellFolder);

            if (filesInFolder.length === 0) {
                console.log('There are no accounts in the Excell folder!');
            }
            const processedData = await processCSV(filePath);
            console.log('Processed Data:', processedData);


            const existingFile = path.join(excellFolder, 'accounts.csv');
            let existingData = [];

            if (fs.existsSync(existingFile)) {
                existingData = fs.readFileSync(existingFile, 'utf-8');
                existingData = new Parser().parse(existingData);
            }

            processedData.forEach((account) => {
                existingData.push(account);
            });

            const json2csvParser = new Parser();
            const updatedCsvContent = json2csvParser.parse(existingData);
            fs.writeFileSync(existingFile, updatedCsvContent);

            res.status(200).send({
                msg: 'Accounts have been added to the Excell folder successfully',
            });
        } catch (error) {
            console.error('Error processing CSV file:', error);
            res.status(500).json({
                msg: 'Failed to process the file',
                error: error.message,
            });
        }
    },
);




router.post(
    '/register',
    adminMiddleware,
    upload.single('file'),
    async (req, res) => {
        console.log('Route /admins/register accessed');

        const filePath = req.file?.path;
        if (!filePath) {
            return res.status(400).send({ msg: 'No file provided' });
        }

        try {
            const processedData = await processCSV(filePath);
            console.log('Processed Data:', processedData);

            // Check if the Excell folder is empty
            const filesInFolder = fs.readdirSync(excellFolder);
            if (filesInFolder.length === 0) {
                return res
                    .status(400)
                    .send({ msg: 'There are no accounts here!' });
            }

            const updatedData = await Promise.all(
                processedData.map(async (account) => {
                    const rawPassword = generatePassword(8); 
                    const salt = await bcrypt.genSaltSync(10);
                    const hashedPassword = await bcrypt.hash(rawPassword, salt);
                    const updatedAccount = {
                        ...account,
                        password: hashedPassword,  
                        role : 'student',
                        "class": account.class || 1
                    };

                    const accountFilePath = path.join(
                        studentFolder,
                        `${account.name}.json`,
                    );
                    if (!fs.existsSync(accountFilePath)) {
                        fs.writeFileSync(
                            accountFilePath,
                            JSON.stringify(updatedAccount, null, 2),
                        );
                    }

                    const emails = JSON.parse(
                        fs.readFileSync(emailsFile, 'utf-8'),
                    );
                    emails[account.email] = account.name;
                    fs.writeFileSync(
                        emailsFile,
                        JSON.stringify(emails, null, 2),
                    );

                    return {...updatedAccount , rawPassword};
                }),
            );

            const json2csvParser = new Parser();
            const updatedCsvContent = json2csvParser.parse(updatedData);

            const csvFilePath = path.join(
                excellFolder,
                `accounts-${Date.now()}.csv`,
            );
            fs.writeFileSync(csvFilePath, updatedCsvContent);

            res.status(200).send({
                msg: 'Accounts have been registered successfully',
            });
        } catch (error) {
            console.error('Error processing the file:', error);
            res.status(500).send({
                msg: 'Error processing the file',
                error: error.message,
            });
        }
    },
);

function getAllAccounts() {
    const accountsDirectory = path.join(__dirname, '../saves/Accounts');
    let allAccounts = [];

    try {
        const files = fs.readdirSync(accountsDirectory);

        files.forEach((file) => {
            if (path.extname(file) === '.json') {
                const filePath = path.join(accountsDirectory, file);

                try {
                    const data = fs.readFileSync(filePath, 'utf-8');
                    const account = JSON.parse(data);
                    allAccounts.push({ filePath, account }); 
                } catch (err) {
                    console.error(`Error reading or parsing file ${file}:`, err);
                }
            }
        });
    } catch (err) {
        console.error("Error reading the accounts directory:", err);
    }

    return allAccounts;
}

const updateAndDeletAcc = (req, res) => {
    const accounts = getAllAccounts();

    if (accounts.length > 0) {
        accounts.forEach((accountData) => {
            const account = accountData.account;
            const filePath = accountData.filePath;

            if (account.class >= 5) {
                account.status = 'graduated';

                try {
                    fs.unlinkSync(filePath);
                    console.log(`Account graduated and removed: ${filePath}`);
                } catch (err) {
                    console.error(
                        `Error removing graduated account file ${filePath}:`,
                        err,
                    );
                    res.status(500).json({
                        status: 'Failed',
                        msg: 'Error removing the graduated account file.',
                    });
                }
            } else {
                account.class += 1;

                try {
                    fs.writeFileSync(
                        filePath,
                        JSON.stringify(account, null, 2),
                    );
                    console.log(`Account updated to next year: ${filePath}`);
                } catch (err) {
                    console.error(
                        `Error saving updated account file ${filePath}:`,
                        err,
                    );
                    res.status(500).json({
                        status: 'Failed',
                        msg: 'Error saving the updated account data.',
                    });
                }
            }
        });

        res.send({ msg: 'Accounts processed successfully.' });
    } else {
        res.status(500).json({
            status: 'Failed',
            msg: 'There are no account data available.',
        });
    }
};
//the router here ...
router.post('/growUp', updateAndDeletAcc);

module.exports = router;
