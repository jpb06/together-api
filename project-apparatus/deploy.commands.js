const fs = require('fs');
const util = require('util');
const GulpSSH = require('gulp-ssh');
const exec = util.promisify(require('child_process').exec);

const consoleUtil = require('./util/console.util.js');

const settings = require('./private/private.config.js');
let pckg = require('./../package.json');

var main = {};

main.sendFileToDeployServer = async function () {

    consoleUtil.printHeader('Sending file to deploy server ...');

    const { stdout, stderr } = await exec(`.\\pscp.exe -P ${settings.port} -l ${settings.user} -i ${settings.priPath} ./release/togetherapi_${pckg.version}.zip ${settings.user}@${settings.srvAddress}:${settings.destPath}`);
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);

    console.log('Done.');
};

main.deploy = function () {

    consoleUtil.printHeader('Deploying ...');

    let gulpSSH = new GulpSSH({
        ignoreErrors: false,
        sshConfig: {
            host: settings.srvAddress,
            port: settings.port,
            username: settings.user,
            privateKey: fs.readFileSync(settings.priPath)
        }
    });

    return gulpSSH
        .shell([`sudo ${settings.deployScriptPath}`], { filePath: `${pckg.version}_deploy.log` })
        .on('ssh2Data', function (data) {
            process.stdout.write(data.toString());
        });
};

module.exports = main;