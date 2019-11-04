const fs = require('fs');
const gulp = require('gulp');
const util = require('util');
const GulpSSH = require('gulp-ssh');
const exec = util.promisify(require('child_process').exec);
const tsc = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const merge = require('merge-stream');

const consoleUtil = require('./util/console.util.js');

const settings = require('./private/private.config.js');
const pckg = require('./../package.json');

const main = {};

main.buildForDev = function () {
    consoleUtil.printHeader('Building api module ...');

    const tsProject = tsc.createProject("tsconfig.json");

    const tsResult =
        tsProject.src()  // OR: gulp.src(['src/**/*.ts'])
            .pipe(sourcemaps.init())
            .pipe(tsProject());

    return merge([
        tsResult.dts.pipe(gulp.dest('dist/typings')),
        tsResult.js.pipe(sourcemaps.write('.')).pipe(gulp.dest('dist/js'))
    ]);
};

main.buildForProd = async function () {
    consoleUtil.printHeader('Building api module ...');

    const tsProject = tsc.createProject("tsconfig.json");

    const tsResult =
        tsProject.src()
            .pipe(tsProject());

    return new Promise((resolve, reject) => {
        tsResult.js
            .pipe(gulp.dest("./dist/js"))
            .on('error', reject)
            .on('end', resolve);
    }).then(function () {
        console.log("Done.");
    });
};

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