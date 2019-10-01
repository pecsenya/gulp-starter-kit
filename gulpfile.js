'use strict';

const {src, dest, series} = require('gulp');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');
const esLint = require('gulp-eslint');
const sourcemap = require('gulp-sourcemaps');
const autoprefix = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');

const sassConfig = 'assets/config/.sass-lint.yml';
const jsConfig = 'assets/config/.eslintrc';


console.log('\n💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');
console.log('💥                                   💥');
console.log('💥            START GULP              💥');
console.log('💥                                   💥');
console.log('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥\n');


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
    
        default:
            break;
    }

    console.log('\n', '\x1b[91m', emoji + '   ' + msg, '\x1b[0m', '\n'); 
}


/********************************/
/*****  PREPARE GULP TASKS  *****/
/********************************/

// Check SCSS files
function lint() {
    return src('assets/_src/scss/**/*.scss')
        .pipe(sassLint({configFile: sassConfig}))
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError());
}

// Check JS files
function jsLint() {
    return src('assets/_src/js/*.js')
        .pipe(esLint({configFile: jsConfig}))
        .pipe(esLint.format())
        .pipe(esLint.failAfterError())
}

// Compile only JS files - prod
function buildJS() {
    customCmdLog('~ Compile, uglify & update JS for PROD ~', 'js');

    return src('assets/_src/js/*.js')
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(dest('assets/js'));
};

// Compile only SCSS files - prod
function buildCss() {
    customCmdLog('~ Compile & update CSS for PROD ~', 'css');

    return src('assets/_src/scss/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefix())
        .pipe(dest('assets/css'));
}

// Compile JS files - dev
function devJS() {
    customCmdLog('~ Compile, update & create sourcemaps JS for DEV ~', 'js');

    return src('assets/_src/js/*.js')
        .pipe(sourcemap.init())
        .pipe(concat('main.js'))
        .pipe(sourcemap.write())
        .pipe(dest('assets/js'));
}

// Compile SCSS files - dev
function devCss() {
    customCmdLog('~ Compile, update & create sourcemaps CSS for PROD ~', 'css');

    return src('assets/_src/scss/**/*.scss')
        .pipe(sourcemap.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemap.write())
        .pipe(dest('assets/css'));
}

// Compress images
function compressImages() {
    customCmdLog('~ Compress images ~', 'img');

    return src('assets/_src/img/**/*')
        .pipe(imagemin([
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('assets/img'));
}

function watchChanges() {
    // Live reload
    watch(src('content/**/*')).on('change', reload);
    watch(src('assets/_src/**/*')).on('change', reload);

    watch(src('assets/_src/scss/**/*.scss'), devCss);
    watch(src('assets/_src/js/*.js'), devJS);
    watch(src('assets/_src/img/**/*'), compressImages);
}

// Default GULP task
exports.default = function() {
    return src('assets/_src/js/*.js')
        .pipe(dest('assets/js'));
};

exports.lint = lint;
exports.jslint = jsLint;
exports.js = buildJS;
exports.css = buildCss;
exports.img = compressImages;
exports.build = series(buildJS, buildCss, compressImages);
exports.dev = series(lint, jsLint, devJS, devCss);
exports.watch = series(devJS, devCss, compressImages);