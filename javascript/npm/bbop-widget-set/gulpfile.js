////
//// gulpfile.js for bbop-widget-set.
////
//// Usage: ./node_modules/.bin/gulp build, clean, test, etc.
////

var gulp = require('gulp');
//var jsdoc = require('gulp-jsdoc');
var mocha = require('gulp-mocha');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var git = require('gulp-git');
var bump = require('gulp-bump');
var del = require('del');
var shell = require('gulp-shell');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var paths = {
    readme: ['./README.md'],
    tests: ['tests/*.test.js', 'tests/*.tests.js'],
    docable: ['lib/*.js', './README.md'],
    transients:['./doc/*', '!./doc/README.org']
};

// Browser runtime environment construction.
gulp.task('build', ['patch-bump', 'doc']);

gulp.task('patch-bump', function(cb){
    gulp.src('./package.json')
	.pipe(bump({type: 'patch'}))
	.pipe(gulp.dest('./'));
    cb(null);
});

gulp.task('minor-bump', function(cb){
    gulp.src('./package.json')
	.pipe(bump({type: 'minor'}))
	.pipe(gulp.dest('./'));
    cb(null);
});

gulp.task('major-bump', function(cb){
    gulp.src('./package.json')
	.pipe(bump({type: 'major'}))
	.pipe(gulp.dest('./'));
    cb(null);
});

// Build docs directory with JSDoc.
//gulp.task('doc', ['md-to-org', 'jsdoc']);
gulp.task('doc', ['jsdoc']);

// Build docs directory with JSDoc.
// Completely dependent on clean before running doc.
// gulp.task('jsdoc', ['clean'], function(cb) {
//     gulp.src(paths.docable, paths.readme)
//         .pipe(jsdoc('./doc'));
//     cb(null);
// });
// TODO: Ugh--do this manually until gulp-jsdoc gets its act together.
gulp.task('jsdoc', ['clean'], function(cb) {
    gulp.src('')
        .pipe(shell([
	    './node_modules/.bin/jsdoc --verbose --template ./node_modules/jsdoc-baseline --readme ./README.md --destination ./doc/ ./lib/*.js'
	]));
    cb(null);
});

///
///
///

function _client_compile_task(file) {

}

// Compile all JS used in AmiGO and move it to the staging/deployment
// directory.
gulp.task('compile', function(cb){

    var infile = './lib/set.js';

    var b = browserify(infile);
    return b
    // not in npm, don't need in browser
	.exclude('ringo/httpclient')
	//.standalone('bbop-widget-set') // 
	.bundle()
    // desired output filename to vinyl-source-stream
	.pipe(source('bundle.js'))
	.pipe(gulp.dest('./dist/'));
});

// Rerun tasks when a file changes.
gulp.task('watch', function(cb) {
    gulp.watch('./lib/*.js', ['compile']);
    cb(null);
});

///
///
///


// Get rid of anything that is transient.
gulp.task('clean', function(cb) {
    del(paths.transients);
    cb(null);
});

// Testing with mocha/chai.
gulp.task('test', function() {
    return gulp.src(paths.tests, { read: false }).pipe(mocha({
	reporter: 'spec',
	globals: {
	    // Use a different should.
	    should: require('chai').should()
	}
    }));
});

//gulp.task('release', ['build', 'publish-npm', 'git-commit', 'git-tag']);
gulp.task('release', ['build', 'publish-npm']);

// Needs to have ""
gulp.task('publish-npm', function() {
    var npm = require("npm");
    npm.load(function (er, npm) {
	// NPM
	npm.commands.publish();	
    });
});

gulp.task('git-commit', function(){
    console.log('TODO: WORK IN PROGRESS');
    // Make a note in the git repo.
    var pkg = require('./package.json');
    var pver = pkg.version;
    gulp.src('./*')
	.pipe(git.commit('Package/version tracking for go-exp/widget: ' + pver));
});

gulp.task('git-tag', function(){
    console.log('TODO: WORK IN PROGRESS');
    // Make a note in the git repo.
    var pkg = require('./package.json');
    var pver = pkg.version;
    git.tag('go-exp-widget-' + pver, 'version message', function (err){
	if(err){ throw err; }
    });
});

// Rerun doc build when a file changes.
gulp.task('watch-doc', function() {
  gulp.watch(paths.docable, ['doc']);
  gulp.watch(paths.readme, ['doc']);
});

// Rerun doc build when a file changes.
gulp.task('watch-test', function() {
  gulp.watch(paths.docable, ['test']);
  gulp.watch(paths.tests, ['test']);
});

// The default task (called when you run `gulp` from cli)
//gulp.task('default', ['watch', 'scripts', 'images']);
gulp.task('default', function() {
    console.log("'allo 'allo!");
});
