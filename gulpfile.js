const gulp = require('gulp')

const babel = require('gulp-babel')
const plumber = require('gulp-plumber')
const sourcemaps = require('gulp-sourcemaps')
const minify = require('gulp-minify')
const clean = require('gulp-clean-dest')

gulp.task('default', function () {
  return gulp
    .src('./src/plotter.js')
    .pipe(plumber())
    .pipe(clean('./dist'))
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: [
        ['@babel/preset-env', {
          'targets': {
            'browsers': '> 1%'
          },
          'modules': 'umd'
        }]
      ],
    }))
    .pipe(minify({ext: {min: '.min.js'}}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist'))
})
