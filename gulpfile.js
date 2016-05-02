var gulp = require('gulp');
var eslint = require('gulp-eslint');
var gulpIgnore = require('gulp-ignore');
var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');

// has gulp-eslint touched the file ?
function isFixed(file) {
  return file.eslint && file.eslint.fixed;
}

gulp.task('lint', function() {
  gulp.src(['**/*.js', '!**/node_modules/**', '!./gulpfile.js'])
  .pipe(eslint())
  .pipe(eslint.format());
});

gulp.task('fix', function() {
  gulp.src(['*.js', '!**/node_modules/**', '!./gulpfile.js'])
  .pipe(eslint({fix: true}))
  .pipe(eslint.format())
  .pipe(gulpIgnore.include(isFixed))
  .pipe(gulp.dest('.'));
});

gulp.task('watch-lint', function() {
  return gulp.watch(['**/*.js', '!**/node_modules/**', '!./gulpfile.js'], ['lint']);  
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
  gulp.src('static/*.html')
  .pipe(livereload());
});

gulp.task('watch-browserify', function() {
  livereload.listen();
  gulp.watch(['static/*.html'], ['browserify']);
});

gulp.task('default', ['start', 'watch-browserify', 'watch-lint']);