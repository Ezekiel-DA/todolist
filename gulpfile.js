'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var gulpIgnore = require('gulp-ignore');
var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');
var browserify = require('browserify');
var babelify = require('babelify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gulpif = require('gulp-if');

// has gulp-eslint touched the file ?
function isFixed(file) {
  return file.eslint && file.eslint.fixed;
}

var production = process.env.NODE_ENV === 'production';

var jsCodeLocs = ['app/*.js', 'models/*.js', 'server/*.js', '!**/node_modules/**', '!./gulpfile.js'];

gulp.task('lint', function() {
  gulp.src(jsCodeLocs)
  .pipe(eslint())
  .pipe(eslint.format());
});

gulp.task('fix', function() {
  gulp.src(jsCodeLocs)
  .pipe(eslint({fix: true}))
  .pipe(eslint.format())
  .pipe(gulpIgnore.include(isFixed))
  .pipe(gulp.dest('.'));
});

gulp.task('watch-lint', function() {
  return gulp.watch(jsCodeLocs, ['lint']);  
});

gulp.task('start', function() {
  nodemon({
    script: './server/server.js',
    watch: ['server', 'models'],
    ignore: ['gulpfile.js'],
    env: {'NODE_ENV': 'development'}
  });
});

gulp.task('browserify', function() {
  return browserify({ entries: 'app/app.js', debug: true })
  .transform(babelify, { presets: ['es2015', 'react'] })
  .bundle()
  .pipe(source('app_bundle.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(gulpif(production, uglify({ mangle: false })))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('static/build'))
  .pipe(livereload());
});

gulp.task('watch-static', function() {
  gulp.watch(['static/*.html'], function() {
    gulp.src(['static/*.html'])
    .pipe(livereload());
  });
});

gulp.task('watch-app', function() {
  gulp.watch(['app/**/*.js'], ['browserify']);
});


gulp.task('default', ['start', 'watch-static', 'watch-app', 'watch-lint'], function() {
  livereload.listen();
});