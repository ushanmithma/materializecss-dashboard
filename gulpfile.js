// Initizlise modules
const { src, dest, watch, series, parallel } = require('gulp')
const gulpif = require('gulp-if')
const sass = require('gulp-sass')(require('sass'))
const postcss = require('gulp-postcss')
const cssnano = require('cssnano')
const autoprefixer = require('autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const concat = require('gulp-concat')
const terser = require('gulp-terser')
const browserSync = require('browser-sync').create()

// File paths variables
const files = {
	scssPath: './src/scss/**/*.scss',
	jsPath: './src/js/**/*.js',
}

// Sass task
let sassTask = () => {
	return src(files.scssPath)
		.pipe(gulpif(process.env.NODE_ENV == 'development', sourcemaps.init()))
		.pipe(sass().on('error', sass.logError))
		.pipe(gulpif(process.env.NODE_ENV == 'production', postcss([autoprefixer('since 2015-03-10'), cssnano()])))
		.pipe(gulpif(process.env.NODE_ENV == 'development', sourcemaps.write('.')))
		.pipe(dest('./public/css'))
}

// JavaScript task
let jsTask = () => {
	return src(files.jsPath)
		.pipe(concat('app.js'))
		.pipe(gulpif(process.env.NODE_ENV == 'development', sourcemaps.init({ loadMaps: true })))
		.pipe(gulpif(process.env.NODE_ENV == 'production', terser({ toplevel: true, output: { comments: false } })))
		.pipe(gulpif(process.env.NODE_ENV == 'development', sourcemaps.write('./')))
		.pipe(dest('./public/js'))
}

let browserSyncServe = (cb) => {
	browserSync.init({
		server: {
			baseDir: '.',
		},
	})
	cb()
}

let browserSyncReload = (cb) => {
	browserSync.reload()
	cb()
}

// Watch task
let watchTask = () => {
	watch('*.html', browserSyncReload)
	watch([files.scssPath, files.jsPath], parallel(sassTask, jsTask, browserSyncReload))
}

exports.build = series(sassTask, jsTask)

exports.dev = series(parallel(sassTask, jsTask), browserSyncServe, watchTask)
