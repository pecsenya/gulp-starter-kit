'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');
const esLint = require('gulp-eslint');
const sourcemap = require('gulp-sourcemaps');
const autoprefix = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const gulpif = require('gulp-if');
const browserSync = require('browser-sync').create();
//var reload = browserSync.reload();

// PROJECT'S DATA
const proxy = 'nonogram.local';
const sassConfig = 'assets/config/.sass-lint.yml';
const jsConfig = 'assets/config/.eslintrc';
const source = 'assets/_src';

console.log('\n');
console.log('\x1b[31m', '💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥', '\x1b[0m');
console.log('\x1b[31m', '💥                                  💥', '\x1b[0m');
console.log('\x1b[31m', '💥        ', '\x1b[0m', '\x1b[93m', 'START GULP', '\x1b[0m', '\x1b[31m', '         💥', '\x1b[0m');
console.log('\x1b[31m', '💥                                  💥', '\x1b[0m');
console.log('\x1b[31m', '💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥', '\x1b[0m', '\n');


/************************/
/*****  CUSTOM LOG  *****/
/************************/

function customCmdLog(msg, type) {
    var emoji = '💥';

    switch (type) {
        case 'clean':           
            emoji = '🗑'
            break;        
        case 'css': 
            emoji = '🎨';
            break;
        case 'js':
            emoji = '✨';
            break;
        case 'img':
            emoji = '🖼';
            break;    
        case 'reload':
            emoji = '⚔';
            break;
        case 'start':
            emoji = '🔫';
        default:
            break;
    }

    console.log('\n', '\x1b[91m', emoji + '   ' + msg, '\x1b[0m', '\n'); 
}

/********************************/
/*****  PREPARE GULP TASKS  *****/
/********************************/

function sync(done) {
    customCmdLog('~ Start syncing ~', 'start');

    browserSync.init({
        proxy: proxy,
        baseDir: './'
    });
    done();
}

function reload(done) {
    customCmdLog('~ Reload page ~', 'reload');

    browserSync.reload();
    done();
}

// Check SCSS files
function lint() {
    return gulp.src(source + '/scss/**/*.scss')
        .pipe(sassLint({configFile: sassConfig}))
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError());
}

// Check JS files
function jsLint() {
    return gulp.src(source + '/js/*.js')
        .pipe(esLint({configFile: jsConfig}))
        .pipe(esLint.format())
        .pipe(esLint.failAfterError())
}

// Compile only JS files - prod
function buildJS() {
    customCmdLog('~ Compile, uglify & update JS for PROD ~', 'js');

    return gulp.src(source + '/js/*.js')
        .pipe(newer('assets/js'))
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(gulp.dest('assets/js'));
};

// Compile only SCSS files - prod
function buildCss() {
    customCmdLog('~ Compile & update CSS for PROD ~', 'css');

    return gulp.src(source + '/scss/**/*.scss')
        .pipe(newer('assets/css'))
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefix())
        .pipe(gulp.dest('assets/css'));
}

// Compile JS files - dev
function devJS() {
    customCmdLog('~ Compile, update & create sourcemaps JS for DEV ~', 'js');

    return gulp.src(source + '/js/*.js')
        .pipe(newer('assets/js'))
        .pipe(sourcemap.init())
        .pipe(concat('main.js'))
        .pipe(sourcemap.write())
        .pipe(gulp.dest('assets/js'));
}

// Compile SCSS files - dev
function devCss() {
    customCmdLog('~ Compile, update & create sourcemaps CSS for DEV ~', 'css');

    return gulp.src(source + '/scss/**/*.scss')
        .pipe(newer('assets/css'))
        .pipe(sourcemap.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemap.write())
        .pipe(gulp.dest('assets/css'))
        .pipe(browserSync.stream({match: '**/*.css'}));
}

// Compress images
function compressImages() {
    customCmdLog('~ Compress images ~', 'img');

    return gulp.src(source + '/img/**/*')
        .pipe(imagemin([
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [{
                    removeViewBox: true,
                    cleanupIDs: false,
                    collapseGroups: true
                }]
            })
        ]))
        .pipe(gulp.dest('assets/img'));
}

function watch() {
    gulp.watch('./assets/_src/scss/**/*.scss', devCss);
    gulp.watch('./template/layout/**/*', reload);
}


// Default GULP task
exports.default = function() {};

exports.lint = lint;
exports.jslint = jsLint;
exports.js = buildJS;
exports.css = buildCss;
exports.img = compressImages;
exports.watch = gulp.parallel(watch, sync);
exports.build = gulp.series(buildJS, buildCss, compressImages);
exports.dev = gulp.series(lint, jsLint, devJS, devCss);
