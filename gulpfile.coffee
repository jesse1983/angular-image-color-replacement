gulp =        require 'gulp'
coffee =      require 'gulp-coffee'
uglify =      require 'gulp-uglifyjs'
sourcemaps =  require 'gulp-sourcemaps'
connect =     require 'gulp-connect'


gulp.task 'default', ->
	gulp.run ['coffee','min']

gulp.task 'coffee', ->
	gulp
		.src ['./src/**/*.coffee']
		.pipe sourcemaps.init()
		.pipe coffee(bare: true)
		.pipe sourcemaps.write()
		.pipe gulp.dest("./dist")

gulp.task 'min', ->
	gulp
		.src ['./src/**/*.coffee']
		.pipe coffee(bare: true)
		.pipe uglify("image-color-replacement.min.js")
		.pipe gulp.dest("./dist")		

gulp.task 'watch', ->
	gulp.watch ['./src/**/*.coffee'], ['coffee','min']

gulp.task 'server', ->
	connect.server
		livereload: true
		port: 6543
