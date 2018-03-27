'use strict'

/* DEPENDENCIES
 ========================= */
var browserSync   = require('browser-sync'),
    del           = require('del'),
    gulp       	  = require('gulp'),
    autoprefixer  = require('gulp-autoprefixer'),
    cache         = require('gulp-cache'),
    gulpif 		  = require('gulp-if'),
    imagemin      = require('gulp-imagemin'),
    minifyCss     = require('gulp-minify-css'),
    scss          = require('gulp-sass'),
    uglify        = require('gulp-uglify'),
    useref        = require('gulp-useref'),
    wiredep       = require('wiredep').stream,
    rigger 		  = require('gulp-rigger');

/* HTML TASKS
 ========================= */
gulp.task('html', function(){
    return gulp.src('app/templates/*.html')
        .pipe(rigger())
        .pipe(gulp.dest('app'))
        .pipe(browserSync.reload({stream: true}));
});

/* SCSS TASKS
 ========================= */
gulp.task('scss', function() {
    return gulp.src('app/scss/**/*.+(scss|sass)')
        .pipe(scss().on('error', scss.logError))
        .pipe(autoprefixer({browsers: ['last 5 versions'], cascade: true}))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({stream: true}));
});

/* JS TASKS
 ========================= */
gulp.task('js', function() {
    return gulp.src('app/js/**/*.js')
        .pipe(gulp.dest('app/js'))
        .pipe(browserSync.reload({stream: true}));
});

/* WIREDEP TASKS
 ========================= */
gulp.task('wiredep', function () {
    return gulp.src('app/templates/helpers/*.html')
        .pipe(wiredep({
            ignorePath: '../../'
        }))
        .pipe(gulp.dest('app/templates/helpers/'));
});

/* BROWSERSYNC
 ========================= */
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'app'
        },
        notify: false
    });
});

/* WATCHER
 ========================= */
gulp.task('watch', ['html', 'browser-sync', 'scss', 'js'], function() {
    gulp.watch('bower.json', ['wiredep']);
    gulp.watch('app/templates/**/*.html', ['html']);
    gulp.watch('app/scss/**/*.+(scss|sass)', ['scss']);
    gulp.watch('app/js/**/*.js', ['js']);
});

/* FONTS TASKS
 ========================= */
gulp.task('fonts', function () {
    return gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));
});

/* IMAGES TASKS
 ========================= */
gulp.task('img', function() {
    return gulp.src(['app/img/**/*'])
        .pipe(cache(imagemin({interlaced: true, progressive: true, svgoPlugins: [{removeViewBox: false}], use: []})))
        .pipe(gulp.dest('dist/img'));
});


/* EXTRASS TASKS
 ========================= */
gulp.task('extrass', function () {
    return gulp.src([
        'app/*.*',
        '!app/robots.txt',
        '!app/bower',
        '!app/scss',
        '!app/vendor',
        '!app/*.html',
        '!app/templates'
    ])
        .pipe(gulp.dest('dist'));
});

/* DEL TASKS
 ========================= */
gulp.task('clean', function() {
    return del.sync('dist');
});

/* CSS-NO-MIN TASKS
 ========================= */
gulp.task('css-no-min', function () {
    return gulp.src('app/css/**/*')
        .pipe(gulp.dest('dist/css'));
});

/* JS-NO-MIN TASKS
 ========================= */
gulp.task('js-no-min', function () {
    return gulp.src('app/js/**/*')
        .pipe(gulp.dest('dist/js'));
});

/* DATA TASKS
 ========================= */
gulp.task('data', function () {
    return gulp.src('app/data/**/*')
        .pipe(gulp.dest('dist/data'));
});

/* VIDEO TASKS
 ========================= */
gulp.task('video', function () {
    return gulp.src('app/video/**/*')
        .pipe(gulp.dest('dist/video'));
});

/* BUILD TASKS
 ========================= */
gulp.task('build', ['clean', 'html', 'scss', 'js'], function () {
    gulp.start('fonts');
    gulp.start('img');
    gulp.start('data');
    gulp.start('video');
    gulp.start('extrass');
    gulp.start('css-no-min');
    gulp.start('js-no-min');
    return gulp.src('app/*.html')
        .pipe(useref())
        .pipe(gulpif('js/*.js', uglify().on('error', function(e){
            console.log(e);
        })))
        .pipe(gulpif('css/*.css', minifyCss({compatibility: 'ie8'})))
        .pipe(gulp.dest('dist'));
});

/* DEFAULT TASKS
 ========================= */
gulp.task('default', ['watch', 'browser-sync']);

/* CLEAR CACHE TASKS
 ========================= */
gulp.task('clear', function (callback) {
    return cache.clearAll();
});