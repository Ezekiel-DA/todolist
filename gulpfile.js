var gulp = require('gulp');
var eslint = require('gulp-eslint');
var gulpIgnore = require('gulp-ignore');
var nodemon = require('gulp-nodemon');

// has gulp-eslint touched the file ?
function isFixed(file) {
  return file.eslint && file.eslint.fixed;
}

gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('lint', function() {
  gulp.src(['**/*.js', '!**/node_modules/**', '!./gulpfile.js'])
  .pipe(eslint())
  .pipe(eslint.format());
});

gulp.task('fix', function() {
  gulp.src(['*.js', '!./gulpfile.js'])
  .pipe(eslint({fix: true}))
  .pipe(eslint.format())
  .pipe(gulpIgnore.include(isFixed))
  .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {
  return gulp.watch(['*.js', '!./gulpfile.js'], ['lint']);  
});

gulp.task('start', function() {
  nodemon({
    script: 'server.js',
    env: {'NODE_ENV': 'development'}
  });
});
