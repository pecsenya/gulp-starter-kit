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
    return src('assets/_src/js/*.js')
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(dest('assets/js'));
};

// Compile only SCSS files - prod
function buildCss() {
    return src('assets/_src/scss/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefix())
        .pipe(dest('assets/css'));
}

// Compile JS files - dev
function devJS() {
    return src('assets/_src/js/*.js')
        .pipe(sourcemap.init())
        .pipe(concat('main.js'))
        .pipe(sourcemap.write())
        .pipe(dest('assets/js'));
}

// Compile SCSS files - dev
function devCss() {
    return src('assets/_src/scss/**/*.scss')
        .pipe(sourcemap.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemap.write())
        .pipe(dest('assets/css'));
}

// Compress images
function compressImages() {
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

//exports.watch = function() {
//    return series(devJS, devCss);
//}

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
exports.watch = series(devJS, devCss);