var argv = require('yargs').argv,
	   _ = require('lodash'),
	path = require('path');
var config = require('./config.json');

var gulp = require('gulp'),
	uglify = require("gulp-uglify"),
	clean = require('gulp-clean'),
	notify = require("gulp-notify"),
	autoprefixer = require("gulp-autoprefixer"),
	minifycss = require("gulp-minify-css"),
	concat = require('gulp-concat'),
	cache = require('gulp-cache'),
	eslint = require('gulp-eslint'),
	gulpif  = require('gulp-if'),
	fileinclude = require('gulp-file-include'),
	rev  = require('gulp-rev'),
	rename = require('gulp-rename'),
	revCollector = require('gulp-rev-collector'),
	runSequence = require('run-sequence'),
	livereload = require('gulp-livereload'),
	browserSync = require('browser-sync'),
	imagemin = require('gulp-imagemin'),
	reload = browserSync.reload;;
gulp.task('help',function(){
	console.log('gulp build         文件打包');
	console.log('gulp watch         文件监控打包');
	console.log('gulp help          gulp参数说明');
	console.log('gulp server        测试server');
	console.log('gulp -p            生产环境');
	console.log('gulp -d            开发环境');
	console.log('gulp -m <module>   部分模块打包（默认全部打包）');
});

gulp.task('default',function(){
	gulp.start('help');
})



gulp.task("buildJs",function(){
	return gulp.src(config.src.js)
			.pipe(gulp.dest(config.develop.js))
			.pipe(uglify())
			.pipe(rename({suffix:'.min'}))
			.pipe(gulp.dest(config.develop.js));
})
gulp.task('buildJsMd5',function(){
	gulp.src(config.src.js)
	.pipe(uglify())
	.pipe(rev())
	.pipe(gulp.dest(config.dest.js))
	.pipe(rev.manifest())
	.pipe(gulp.dest(config.dest.js));
});
gulp.task('buildCss', function(){
	return gulp.src(config.src.css)
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(minifycss())
		.pipe(rename({suffix:'.min'}))
		.pipe(gulp.dest(config.develop.css))
});
gulp.task('buildCssMd5',function(){
	gulp.src(config.src.css)
	.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
	.pipe(minifycss())
	.pipe(rev())
	.pipe(gulp.dest(config.dest.css))
	.pipe(rev.manifest())
	.pipe(gulp.dest(config.dest.css));
});
// html 组件化
gulp.task('buildHTML', function(){
	return gulp.src(config.src.html)
		.pipe(fileinclude({
			prefix:'@@',
			basepath:'@file'
		}))
		.pipe(gulp.dest(config.develop.html))
});
gulp.task('buildImg', function(){
	return gulp.src(config.src.image)
		.pipe(cache(imagemin()))
		.pipe(gulp.dest(config.develop.image))
});
gulp.task('buildImgMd5', function(){
	return gulp.src(config.src.image)
		.pipe(cache(imagemin()))
		.pipe(gulp.dest(config.dest.image))
});
gulp.task("clean",function(){
	return gulp.src(config.develop.html,{read:false})
	.pipe(clean());
});
gulp.task("cleanMd5",function(){
	return gulp.src(config.dest.html,{read:false})
	.pipe(clean());
});
gulp.task('rev',function () {
    gulp.src([config.dest.html +'/**/*.json', config.src.html])
       .pipe( revCollector() )
       .pipe(gulp.dest(config.dest.html));
});
/* 打包方法 */

/*gulp.task('build',function(){
	var evr = argv.p || !argv.d; //生产环境为true，开发环境为false，默认为true
	var mod = argv.m || 'all';//模块明，默认为全部
	console.log(evr);
})*/

gulp.task("build",function(callback){
	var evr = argv.p || !argv.d; //生产环境为true，开发环境为false，默认为true
	if(evr){
		runSequence('clean',
			['buildJs','buildCss','buildImg'],
			'buildHTML',
			callback);
	}else{
	runSequence('cleanMd5',
		['buildJsMd5','buildCssMd5','buildImgMd5'],
		'rev',
		callback);
	}
})
gulp.task('watch',function(){
	browserSync({
		server:{
			baseDir:'./src',
			tunnel:true
		}
	});
	gulp.watch(config.src.html,reload);
	gulp.watch(config.src.css);
	gulp.watch(config.src.js);

});
