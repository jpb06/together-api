const fs = require('fs-extra');

const consoleUtil = require('./../util/console.util');

const main = {};

main.cleanDist = async function () {

    consoleUtil.printHeader('Cleaning dist folder ...');

    await fs.emptyDir('./dist');
};

main.generatePackage = async function () {

    consoleUtil.printHeader('Generating package.json file ...');

    const package = JSON.parse(fs.readFileSync('./package.json').toString());

    const distPackage = {
        name: package.name,
        version: package.version,
        description: package.version,
        main: package.main,
        types: package.types,
        author: package.author,
        dependencies: package.dependencies
    };

    await fs.writeFile('./dist/package.json', JSON.stringify(distPackage, null, 2), 'utf8');
};

main.useDevConfig = async function () {

    consoleUtil.printHeader('Using dev config ...');

    await fs.copy('./src/config/dev.config.json', './dist/js/config/current.config.json');
};

main.useProdConfig = async function () {

    consoleUtil.printHeader('Using prod config ...');

    await fs.copy('./src/config/prod.config.json', './dist/js/config/current.config.json');
};

main.copyReadme = async function () {

    consoleUtil.printHeader('Copying readme ...');

    await fs.copy('./README.md', './dist/README.md');
};

module.exports = main;
