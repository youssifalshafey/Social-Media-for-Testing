
async function processCSV(filePath) {
    console.log(`procces`);
    return new Promise((resolve, reject) => {
        const csvData = [];
        let isEmpty = true;
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => 
                {
                isEmpty = false
                console.log(`data is ${data}`);
                csvData.push(data)
            })
            .on('end', () => {
                fs.unlinkSync(filePath);
                console.log(`File processed successfully`);
                if(isEmpty){
                    return reject(`it's empty`)
                }
                resolve(csvData);
            })
            .on('error', (err) => {
                console.error(`Error processing file: ${err.message}`);
                reject(err);
            });
    });
}

module.exports = {processCSV}