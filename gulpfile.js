'use strict';

const {src, dest, watch, series} = require('gulp');
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');
const esLint = require('gulp-eslint');
const sourcemap = require('gulp-sourcemaps');
const autoprefix = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const gulpif = require('gulp-if');
const browserSync = require('browser-sync').create();
//var reload = browserSync.reload();

// PROJECT'S DATA
const proxy = 'localhost:3000';
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
        default:
            break;
    }

    console.log('\n', '\x1b[91m', emoji + '   ' + msg, '\x1b[0m', '\n'); 
}

/********************************/
/*****  PREPARE GULP TASKS  *****/
/********************************/


function serve() {
    browserSync.init({
        watch: true,
        server: {
            proxy: proxy,
            baseDir: './'
        },
        files: [
            './assets/css/*.css',
            './assets/js/*.js'
        ]
    });

    watch('assets/_src/scss/*.scss', devCss);
    watch('./*.html').on('change', browserSync.reload);
}

// Check SCSS files
function lint() {
    return src(source + '/scss/**/*.scss')
        .pipe(sassLint({configFile: sassConfig}))
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError());
}

// Check JS files
function jsLint() {
    return src(source + '/js/*.js')
        .pipe(esLint({configFile: jsConfig}))
        .pipe(esLint.format())
        .pipe(esLint.failAfterError())
}

// Compile only JS files - prod
function buildJS() {
    customCmdLog('~ Compile, uglify & update JS for PROD ~', 'js');

    return src(source + '/js/*.js')
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(dest('assets/js'));
};

// Compile only SCSS files - prod
function buildCss() {
    customCmdLog('~ Compile & update CSS for PROD ~', 'css');

    return src(source + '/scss/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefix())
        .pipe(dest('assets/css'));
}

// Compile JS files - dev
function devJS() {
    customCmdLog('~ Compile, update & create sourcemaps JS for DEV ~', 'js');

    return src(source + '/js/*.js')
        .pipe(sourcemap.init())
        .pipe(concat('main.js'))
        .pipe(sourcemap.write())
        .pipe(dest('assets/js'));
}

// Compile SCSS files - dev
function devCss() {
    customCmdLog('~ Compile, update & create sourcemaps CSS for DEV ~', 'css');

    return src(source + '/scss/**/*.scss')
        .pipe(sourcemap.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemap.write())
        .pipe(dest('assets/css'))
        .pipe(browserSync.stream());
}

// Compress images
function compressImages() {
    customCmdLog('~ Compress images ~', 'img');

    return src(source + '/img/**/*')
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


// Default GULP task
exports.default = function() {
    return src(source + '/js/*.js')
        .pipe(dest('assets/js'));
};

exports.lint = lint;
exports.jslint = jsLint;
exports.js = buildJS;
exports.css = buildCss;
exports.img = compressImages;
exports.watch = serve;
exports.build = series(buildJS, buildCss, compressImages);
exports.dev = series(lint, jsLint, devJS, devCss);
