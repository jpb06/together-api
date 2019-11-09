const util = require('util');
const exec = util.promisify(require('child_process').exec);

const consoleUtil = require('./../util/console.util');

var main = {};

main.typescriptBuild = async function () {

    consoleUtil.printHeader('Building ...');

    const { stdout, stderr } = await exec('tsc --build');

    if (stdout.length > 0)
        consoleUtil.printSuccess(stdout);

    if (stderr.length > 0)
        consoleUtil.printError(stderr);
};

module.exports = main;