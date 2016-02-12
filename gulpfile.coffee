gulp =        require 'gulp'
coffee =      require 'gulp-coffee'
uglify =      require 'gulp-uglify'
connect =     require 'gulp-connect'

gulp.task 'coffee', ->
	gulp
		.src ['./src/**/*.coffee']
		.pipe coffee(bare: true)
		.pipe uglify()
		.pipe gulp.dest("./dist")
		
gulp.task 'watch', ->
	gulp.watch ['./src/**/*.coffee'], ['coffee']

gulp.task 'server', ->
	connect.server
		livereload: true
