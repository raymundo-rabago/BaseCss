var gulp                = require('gulp'),
    nib                 = require('nib'),
    browserSync         = require('browser-sync'),
    plumber             = require('gulp-plumber'),
    rename              = require('gulp-rename'),
    postcss             = require('gulp-postcss'),
    mqpacker            = require('css-mqpacker'),
    cssnano             = require('cssnano'),
    autoprefixer        = require('autoprefixer'),
    stylus              = require('gulp-stylus'),
    jade                = require('gulp-jade'),
    uglify              = require('gulp-uglify'),
    concat              = require('gulp-concat');

// STYLES
gulp.task('styles', function () {
  var processors = [
    autoprefixer({browsers: ['last 2 version']}),
    mqpacker(),
    cssnano()
  ];
  gulp.src('./src/css/app.styl')
    .pipe(stylus({ use: nib() }))
    .pipe(postcss(processors))
    .pipe(plumber())
    .pipe(rename( {suffix: ".min"} ))
    .pipe(gulp.dest('./build/assets/css'))
    .pipe(browserSync.stream());
});

// SCRIPTS
gulp.task('js', function() {
  return gulp.src('./src/js/*.js')
    .pipe( concat('app.min.js'))
    .pipe( uglify() )
    .pipe( gulp.dest('./build/assets/js/'));
});

// TEMPLATES
gulp.task('views', function() {
  return gulp.src('src/*.jade')
    .pipe( jade({ pretty: true }))
    .pipe( gulp.dest('./build'));
});

// SERVER
gulp.task('server', function() {
    browserSync.init({
        notify: false,
        server: {
            baseDir: "./build"
        }
    });
});

// WATCH
gulp.task('watch', function () {
    gulp.watch(['./src/css/**/*.styl'], ['styles']);
    gulp.watch('./src/**/*.jade',['views']);
    gulp.watch("./build/*.html").on('change', browserSync.reload);
});

// DEFAULT
gulp.task('default', ['watch', 'server']);