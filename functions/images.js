const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg");

// Set the FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath.path);

const imageTypes = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "svg",
    "webp",
    "heif",
    "bmp",
    "tiff",
    "ico",
];

// Function to compress image
/**
 *
 * @param {string} inputFile
 * @param {string} outputFile
 * @param {string} postId
 * @param {Response} res
 */
function compressImg(inputFile, outputFile, postId, res) {
    if (imageTypes.includes(inputFile.split(".").at(-1))) {
        ffmpeg(inputFile)
        .output(outputFile)
        .size("40%")
        .on("end", () => {
            console.log(`Image compressed: ${outputFile}`);
            globalEvents.emit("compressDone", postId, res);
        })
        .on("error", (err) => {
            console.error("Error:", err.message);
        })
        .run();
    }else{
        globalEvents.emit("compressDone", postId, res);
    }
}

function compressUserImage(inputFile, outputFile) {
    ffmpeg(inputFile)
        .output(outputFile)
        .size("20%")
        .on("end", () => {
            console.log(`Image compressed: ${outputFile}`);
        })
        .on("error", (err) => {
            console.error("Error:", err.message);
        })
        .run();
}

module.exports = { compressImg, compressUserImage };
