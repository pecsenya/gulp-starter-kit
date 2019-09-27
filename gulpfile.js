'use strict';

const {src, dest, series} = require('gulp');
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');
const sourcemap = require('gulp-sourcemaps');

const sassConfig = 'assets/config/.sass-lint.yml'

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

// Compile only JS files - prod
function buildJS() {
    return src('assets/_src/js/*.js')
        .pipe(dest('assets/js'));
};

// Compile only SCSS files - prod
function buildCss() {
    return src('assets/_src/scss/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(dest('assets/css'));
}

// Default GULP task
exports.default = function() {
    return src('assets/_src/js/*.js')
        .pipe(dest('assets/js'));
};

exports.lint = lint;
exports.js = buildJS;
exports.css = buildCss;
exports.build = series(buildJS, buildCss);
exports.dev = series(lint, buildJS, buildCss);