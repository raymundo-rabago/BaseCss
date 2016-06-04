var gulp                = require('gulp'),
    nib                 = require('nib'),
    browserSync         = require('browser-sync'),
    plumber             = require('gulp-plumber'),
    postcss             = require('gulp-postcss'),
    mqpacker            = require('css-mqpacker'),
    autoprefixer        = require('autoprefixer'),
    stylus              = require('gulp-stylus'),
    jade                = require('gulp-jade'),
    uglify              = require('gulp-uglify'),
    concat              = require('gulp-concat');


// STYLES
gulp.task('styles', function () {
  var processors = [
    autoprefixer({browsers: ['last 4 version']}),
    mqpacker()
  ];
  gulp.src('./src/css/app.styl')
    .pipe(stylus({
        compress: true,
        use: nib()
    }))
    .pipe(postcss(processors))
    .pipe(plumber())
    .pipe(gulp.dest('./build/assets/css'));
});

// SCRIPTS
gulp.task('js', function() {
  return gulp.src('./src/js/*.js')
    .pipe( uglify() )
    .pipe( concat('scripts.min.js'))
    .pipe( gulp.dest('./build/assets/js/'));
});

// TEMPLATES
gulp.task('views', function() {
  return gulp.src('src/*.jade')
    .pipe( jade({ pretty: true }))
    .pipe( gulp.dest('build/'));
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
    gulp.watch('./src/**/*.jade',['views']);
    gulp.watch("./build/*.html").on('change', browserSync.reload);
});

// DEFAULT
gulp.task('default', ['watch', 'server']);