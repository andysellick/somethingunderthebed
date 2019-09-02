'use strict'
// File paths
const paths = {
	templates: {
		src: 'src/',
		dest: 'dist/'
	},
	images: {
   src:  'src/static/img/',
   dest: 'dist/static/img/'
 },
 scripts: {
  src:  'src/static/js/',
  dest: 'dist/static/js/'
},
styles: {
  src:  'src/static/less/',
  dest: 'dist/static/css/'
},
assets: {
  src:  'src/static/assets/',
  dest: 'dist/static/assets/'
},
bower: {
 src:  'src/static/bower_components/',
 dest: 'dist/static/bower_components/'
}
};

// Initialization
const gulp = require('gulp'),
fs = require('fs'),
$ = require('gulp-load-plugins')({
 pattern: '*',
 camelize: true
}),
browserSync = $.browserSync.create(),
prefix = new $.lessPluginAutoprefix({ browsers: [
  'iOS >= 8',
  'Chrome >= 30',
  'Explorer >= 11',
  'Last 2 Edge Versions',
  'Firefox >= 25'
  ]}),
			// Get data from JSON for the File Generation
			filevalues = require('./src/static/assets/_file_data.json');

// FILE GENERATOR ***********************************

	// Get the template file to work with using fs module from _file_template.html
	var filecontent = fs.readFileSync(paths.assets.src + '_file_template.html', 'utf8');
	//Results from the generateFile function sending the number of objects and the template contents
	console.log(filevalues.length);
	var filevariables = generateFile(filevalues.length, filecontent);

	// Creates the number of files, name of files and execute the generateFile function
	function createFile(filename, filevariables) {
		var src = require('stream').Readable({ objectMode: true })
		src._read =  function() {
			for(var f = 0; f < filevariables.length; f++){
				this.push(new $.util.File({ cwd: '', base: '', path: filename.replace('_file_template', filevalues[f].fileName), contents: new 	Buffer(filevariables[f]) }));
			}
      this.push(null);
    }
    return src;
  }

	// Create the file content in the form of an array. In this case we take the string from an Array of objects
	function generateFile(numfiles, filecontent) {
		var output = [];
		// Iterate thought the Array
		for(var i = 0; i < numfiles; i++){
			var data = filevalues[i];
			var thisfile = filecontent;
			// Iterate thought the Objects in the array
			for(var key in data){
				// RegExp to replace {{ items }} with the objects values
				var regex = new RegExp('{{'+ key +'}}', 'g');
				thisfile =  thisfile.replace(regex, data[key]);
			}
			output.push(thisfile);
		}
		return output;
	}

	// Clean directory
	gulp.task('cleanFiles', () => $.del.sync(paths.assets.src + 'files/*'));

	// Invoke the task to generate files
	gulp.task('generateFiles', ['cleanFiles'], () => {
		return createFile('_file_template.html', filevariables)
		.pipe(gulp.dest(paths.assets.src + 'files/'))
	});

// End FILE GENERATOR ********************************

// CSS - LESS
gulp.task('styles', () => {
	const onError = function(err) {
		$.notify.onError({
			title: 'CSS Error',
			subtitle: 'Syntax error in CSS!',
			message:  err.message,
			sound: 'Beep'
		})(err);
		this.emit('end');
	};
  return gulp.src(paths.styles.src + 'styles.less')
  .pipe($.plumber({errorHandler: onError}))
  .pipe($.newer(paths.styles.dest))
  .pipe($.sourcemaps.init())
  .pipe($.less({
    paths: [$.path.join(__dirname, 'less', 'includes')],
    plugins: [prefix]
  }))
  .pipe($.rename({suffix: '.min'}))
  .pipe($.cssnano())
  .pipe($.sourcemaps.write('./_maps'))
  .pipe(gulp.dest(paths.styles.dest))
  .pipe(browserSync.stream({match: '*.css'}));
});

// JS - Scripts
gulp.task('scripts', () => {
	const onError = function(err) {
		$.notify.onError({
			title: 'Javascript Error',
			subtitle: 'Syntax error in script!',
			message:  $.util.colors.yellow(err.message),
			sound: 'Beep'
		})(err);
		this.emit('end');
	};
  return gulp.src(paths.scripts.src + '*.js', [], { base: './static/js/' })
  .pipe($.plumber({errorHandler: onError}))
  .pipe($.bytediff.start())
  .pipe($.newer(paths.scripts.dest))
  .pipe($.jshint('.jshintrc'))
  .pipe($.jshint.reporter('jshint-stylish'))
  .pipe($.concat('main.js'))
  .pipe($.rename({suffix: '.min'}))
  .pipe($.uglify())
  .pipe($.bytediff.stop())
  .pipe(gulp.dest(paths.scripts.dest))
  .pipe(browserSync.stream());
});

// HTML
gulp.task('html', () => {
  return gulp.src(paths.templates.src + '**/*.html')
  .pipe($.htmlmin({collapseWhitespace: true, minifyJS: true, minifyCSS: true}))
  .pipe($.newer(paths.templates.dest))
  .pipe(gulp.dest(paths.templates.dest))
  .pipe(browserSync.stream());
});

// Images
gulp.task('images', () => {
  return gulp.src(paths.images.src + '**/*',{base: paths.images.src})
  .pipe($.plumber(function(error) {
    $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message));
    this.emit('end');
  }))
  .pipe($.newer(paths.images.dest))
    //.pipe($.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest(paths.images.dest))
  });

// Assets
gulp.task('assets', () => {
  return gulp.src(paths.assets.src + '**/*')
  .pipe($.newer(paths.assets.dest))
  .pipe(gulp.dest(paths.assets.dest));
});

// Bower
gulp.task('bower',() => {
  return gulp.src(paths.bower.src + '**/*')
  .pipe(gulp.dest(paths.bower.dest));
});

// Clear Cache
gulp.task('clear', () => $.cache.clearAll());

// Clean destination dir and clear cache
gulp.task('clean', ['clear'], (done) => {
	$.del.sync([paths.templates.dest + '*']);
	done();
});

// BrowserSync
gulp.task('browser-sync', ['styles', 'scripts', 'images', 'html', 'assets', 'bower'], () => {
	browserSync.init(paths.styles.dest + '*.css', {
		server: './dist/'
		// notify: false Will not show notify banner on reload or injected
		// open: false; Will not open a browser window automatically
		// online: false; Will not attempt to determine your network status
	});
	// Watchers
	gulp.watch(paths.styles.src + '**/*.less', ['styles']);
	gulp.watch(paths.scripts.src + '**/*.js', ['scripts']);
	gulp.watch(paths.templates.src + '**/*.html', ['html']);
	gulp.watch(paths.images.src + '**/*', ['images']).on('change', browserSync.reload);
	gulp.watch(paths.assets.src + '**/*', ['assets']).on('change', browserSync.reload);
});

// Default task
gulp.task('default', ['clean'], () => {
  gulp.start('browser-sync');
});
