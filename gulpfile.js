/// <binding BeforeBuild='clean, useDevConfig' AfterBuild='generatePackage, moveReadme, zip, createFolders' Clean='clean' />
const gulp = require('gulp');

const zippingTasks = require('./project-apparatus/tasks/zipping.tasks.js');
const fileSystemTasks = require('./project-apparatus/tasks/file.system.tasks.js');
const deployTasks = require('./project-apparatus/tasks/deploy.tasks.js');
const buildTasks = require('./project-apparatus/tasks/build.tasks.js');

const pckg = require('./package.json');

gulp.task('generatePackage', async () => {
    await fileSystemTasks.generatePackage();
});

gulp.task('moveReadme', async () => {
    await fileSystemTasks.copyReadme();
});

gulp.task('useDevConfig', async () => {
    await fileSystemTasks.useDevConfig();
});

gulp.task('useReleaseConfig', async () => {
    await fileSystemTasks.useProdConfig();
});

gulp.task('clean', async () => {
    await fileSystemTasks.cleanDist();
});

gulp.task('tscbuild', async () => {
    await buildTasks.typescriptBuild();
});

gulp.task('zip', async () => {
    await zippingTasks.zipDirectory('./dist', `./release/togetherapi_${pckg.version}.zip`);
});

gulp.task('deploy', async () => {
    await fileSystemTasks.useProdConfig();

    await fileSystemTasks.generatePackage();

    await zippingTasks.zipDirectory('./dist', `./release/togetherapi_${pckg.version}.zip`);

    await deployTasks.sendFileToDeployServer();

    return deployTasks.deploy();
});