const fs = require('fs');
const archiver = require('archiver');

const consoleUtil = require('./../util/console.util');

const main = {};

main.zipDirectory = function (source, out) {

    consoleUtil.printHeader('Zipping dist folder ...');

    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(out);

    return new Promise((resolve, reject) => {
        archive
            .directory(source, false)
            .on('error', err => reject(err))
            .pipe(stream);

        stream.on('close', () => {
            resolve();
        });
        archive.finalize();
    });
};

module.exports = main;