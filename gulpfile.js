var gulp                = require('gulp'),
    browserSync         = require('browser-sync'),
    plumber             = require('gulp-plumber'),
    postcss             = require('gulp-postcss'),
    mqpacker            = require("css-mqpacker"),
    autoprefixer        = require('autoprefixer'),
    stylus              = require('gulp-stylus');


gulp.task('styles', function () {
  var processors = [
    autoprefixer({browsers: ['last 4 version']}),
    mqpacker
  ];
  gulp.src('./src/css/app.styl')
    .pipe(stylus())
    .pipe(postcss(processors))
    .pipe(plumber())
    .pipe(gulp.dest('./build/assets/css'));
});


// SERVER
gulp.task('server', function() {
    browserSync.init({
        notify: false,
        server: {
            baseDir: "./"
        }
    });
});


// WATCH
gulp.task('watch', function () {
    gulp.watch(['./src/**/**/*.styl'], ['styles']);
    gulp.watch("./*.html").on('change', browserSync.reload);
});


// DEFAULT
gulp.task('default', ['watch', 'server']);