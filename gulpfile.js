////
//// gulpfile.js for AmiGO.
////
//// Comprehensive for more flexible programmatic replacement for
//// Makefile (which depended to much on weird hard-coded chains of
//// ENV vars).
////
//// Usage: npm install && node ./node_modules/.bin/gulp doc|build|test|watch|clean
////

var us = require('underscore');
var fs = require('fs');
var del = require('del');
var gulp = require('gulp');
var bump = require('gulp-bump');
var flatten = require('gulp-flatten');
var mocha = require('gulp-mocha');
var shell = require('gulp-shell');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var yaml = require('yamljs');
var tilde = require('expand-home-dir');
var request = require('request');
var server_restarter = require('gulp-develop-server');
//var watch = require('gulp-watch');
//var git = require('gulp-git');
//var watchify = require('watchify');
//var concat = require('gulp-concat');
//var sourcemaps = require('gulp-sourcemaps');

///
/// Helpers.
///

function _die(str){
    console.error(str);
    process.exit(-1);
}

// Ping server; used during certain commands.
function _ping_count(){

    if( count_url && typeof(count_url) === 'string' && count_url !== '' ){

	request({
	    url: count_url
	}, function(error, response, body){
	    if( error || response.statusCode !== 200 ){
		console.log('Unable to ping: ' + count_url);
	    }else{
		console.log('Pinged: ' + count_url);
	    }
	});
    }else{
	console.log('Will not ping home.');
    }
}

function _tilde_expand(ufile){
    return tilde(ufile);
}

function _tilde_expand_list(list){
    return us.map(list, function(ufile){
	//console.log('ufile: ' + ufile);
	return tilde(ufile);
    });
}

function _to_boolean(thing){
    var ret = false;

    if( typeof(thing) === 'string' ){
	if( thing === 'true' ){
	    ret = true;
	}else if( thing === '1' ){
	    ret = true;
	}
    }else if( typeof(thing) === 'number' ){
	if( thing === 1 ){
	    ret = true;
	}
    }

    return ret;
}

function _run_cmd(command_bits){
    var final_command = command_bits.join(' ');
    return ['echo \'' + final_command + '\'', final_command];
}

function _run_cmd_list(commands){
    var final_list = [];

    us.each(commands, function(cmd){
	final_list.push('echo \'' + cmd + '\'');
	final_list.push(cmd);
    });

    return final_list;
}

///
/// Bring in the AmiGO and working environment.
///

var paths = {
    // WARNING: Cannot use glob for clients--I use the explicit listing
    // to generate a dynamic browserify set.
    clients: [

    ],
    scripts: [
	'scripts/*'
    ],
    'tests-perl': [
	'perl/lib/t/*.t'
    ],
    'tests-js': [
	// 'javascript/lib/amigo/*.js.tests',
	// 'javascript/lib/amigo/data/*.js.tests',
	// 'javascript/lib/amigo/ui/*.js.tests',
	// 'javascript/lib/amigo/handlers/*.js.tests'
    ]
};

var amigo_yaml_path = './conf/amigo.yaml';
var a = null;
try {
    a = yaml.load(amigo_yaml_path);
    //console.log(a);
} catch(err) {
    _die('Unable to load "' + amigo_yaml_path + '", did you read the docs?');
}
if( ! a ){
    _die('Config "' + amigo_yaml_path + '" was bad!');
}

// Common variables.
//var amigo_version =  a['AMIGO_VERSION'].value;
var amigo_root_path = a['AMIGO_ROOT'].value;
var amigo_js_dev_path = amigo_root_path + '/javascript/web';
var amigo_js_out_path = amigo_root_path + '/javascript/staging';
var amigo_url = a['AMIGO_DYNAMIC_URL'].value;
var golr_private_url = a['AMIGO_PRIVATE_GOLR_URL'].value;
var golr_public_url = a['AMIGO_PUBLIC_GOLR_URL'].value;
var owltools_max_memory = a['OWLTOOLS_MAX_MEMORY'].value || '4G';
var owltools_runner = 'java -Xms1024M -DentityExpansionLimit=4086000 -Djava.awt.headless=true -Xmx' + owltools_max_memory + ' -jar ./java/lib/owltools-runner-all.jar';
var metadata_list = _tilde_expand_list(a['GOLR_METADATA_LIST'].value);
var metadata_string = metadata_list.join(' ');
var ontology_metadata = tilde(a['GOLR_METADATA_ONTOLOGY_LOCATION'].value);
var ontology_list = _tilde_expand_list(a['GOLR_ONTOLOGY_LIST'].value);
var ontology_string = ontology_list.join(' ');
var gaf_list = _tilde_expand_list(a['GOLR_GAF_LIST'].value);
var gaf_string = gaf_list.join(' ');
var panther_file_path = tilde(a['GOLR_PANTHER_FILE_PATH'].value);
var catalog_file = tilde(a['GOLR_CATALOG_LOCATION'].value);
var noctua_file_path = tilde(a['GOLR_NOCTUA_ENRICHED_MODEL_PATH'].value);
var noctua_model_prefix = 'http://noctua.berkeleybop.org/editor/graph/';
var working_path = tilde(a['AMIGO_WORKING_PATH'].value);
var solr_load_log = working_path + '/golr_timestamp.log';
var d = new Date();
var time = d.getHours() + ':' + d.getSeconds();
var date = d.getFullYear() + ':' + d.getMonth() + ':' + d.getDate();
// Execute by default; variable must be present and empty to stop.
var count_url =
	'https://s3-us-west-1.amazonaws.com/go-amigo-usage-master/ping.json';
if( a['AMIGO_COUNTER_URL'] && a['AMIGO_COUNTER_URL'].value ){
    count_url = a['AMIGO_COUNTER_URL'].value;
}
// Optional API port.
var amigo_api_port = 6455;
if( a['AMIGO_API_PORT'] && a['AMIGO_API_PORT'].value ){
    amigo_api_port = a['AMIGO_API_PORT'].value;
}

// The OWLTools options are a little harder, and variable with the
// load we're attempting.
var otu_mrg_imp_p = _to_boolean(a['OWLTOOLS_USE_MERGE_IMPORT'].value);
var otu_rm_dis_p = _to_boolean(a['OWLTOOLS_USE_REMOVE_DISJOINTS'].value);
var all_owltools_ops_flags_list = [
    '--log-info',
    '--merge-support-ontologies',
    // Make load less sensitive and more collapsed.
    //(otu_mrg_imp_p ? '--merge-import http://purl.obolibrary.org/obo/go/extensions/go-plus.owl' : '' ),
    (otu_mrg_imp_p ? '--merge-imports-closure' : '' ),
    '--remove-subset-entities upperlevel',
    (otu_rm_dis_p ? '--remove-disjoints' : ''),
    '--silence-elk --reasoner elk',
    '--solr-taxon-subset-name amigo_grouping_subset',
    '--solr-eco-subset-name go_groupings'
];
var owltools_ops_flags =
	all_owltools_ops_flags_list.join(' ').replace(/ +/g, ' ');

// Verbosity.
//console.log('AmiGO version: ' + amigo_version);
console.log('AmiGO location: ' + amigo_url);
console.log('GOlr (private loading) location: ' + golr_private_url);
console.log('OWLTools invocation: ' +
	    owltools_runner + ' ' + owltools_ops_flags + '');
//console.log('Ontologies: ' + ontology_string);
//console.log('Ontology metadata: ' + ontology_metadata);

// Execute counter.
_ping_count();

///
/// Tests (async).
///

gulp.task('tests', ['test-meta',
		    'test-perl',
		    'test-js',
		    'test-app']);

gulp.task('test-meta', function () {
    return gulp.src(metadata_list, {read: false})
	.pipe(shell(_run_cmd_list([
	    'kwalify -f ./scripts/schema.yaml <%= file.path %> | grep INVALID; test $? -ne 0'
	])));
});

gulp.task('test-perl', function () {
    return gulp.src(paths['tests-perl'], {read: false})
	.pipe(shell([
	    'perl -I ./perl/lib/ <%= file.path %>'
	]));
});

gulp.task('test-js', function () {
    return gulp.src(paths['tests-js'], {read: false})
	.pipe(shell(_run_cmd_list([
	    'rhino -modules external/bbop.js -modules javascript/staging/amigo2.js -opt -1 -f <%= file.path %> | grep -i fail; test $? -ne 0'
	])));
});

//
gulp.task('test-app', shell.task(_run_cmd_list(
    ['bash -c "source ./test-app/behave/bin/activate && TARGET=' + amigo_url + ' BROWSER=phantomjs behave ./test-app/behave/"']
    //['bash -c "source ./test-app/behave/bin/activate && TARGET=' + amigo_url + ' BROWSER=firefox behave ./test-app/behave/*.feature"']
)));

///
/// Docs.
///

gulp.task('docs', shell.task(_run_cmd_list(
    [//'naturaldocs --rebuild-output --input ./javascript/lib/amigo --project javascript/docs/.naturaldocs_project/ --output html javascript/docs',
     'naturaldocs --rebuild-output --input ./perl/lib/ --project perl/docs/.naturaldocs_project/ --output html perl/docs']
)));

///
/// AmiGO install.
///

gulp.task('install', ['compile', 'build']);

// TODO/BUG: This should eventually be replaced by a read of
// javascript/web. For now, we'll just have this so we can work our
// way through the garage fixing things at our leisure.
var web_compilables = [
    // 'DDBrowse.js', // current working set
    // 'Matrix.js'    // current working set
    // 'LiveSearchGOlr.js'    // current working set
    // 'Browse.js'    // current working set
    // 'FreeBrowse.js'    // current working set
    // 'ReferenceDetails.js'    // current working set
    // 'AmiGOOntView.js'    // current working set
    ///
    'AReactThing.js',
    'AWebComponentThing.js',
    'AmiGOBioView.js',
    'AmiGOCytoView.js',
    'AmiGOOntView.js',
    'BaseStatistics.js',
    'Browse.js',
    'BulkSearch.js',
    'DDBrowse.js',
    'FacetMatrix.js',
    'GeneralSearchForwarding.js',
    'Gannet.js',
    'GOOSE.js',
    'GPDetails.js',
    'Grebe.js',
    'Matrix.js',
    'Medial.js',
    'LandingGraphs.js',
    'LiveSearchGOlr.js',
    'LoadDetails.js',
    'ReferenceDetails.js',
    'REPL.js',
    'Schema.js',
    'TermDetails.js'
];

// See what browserify-shim is up to.
//process.env.BROWSERIFYSHIM_DIAGNOSTICS = 1;
// Browser runtime environment construction.
function _client_compile_task(file) {

    var infile = amigo_js_dev_path + '/' +file;
    //var outfile = amigo_js_out_path + '/' +file;

    return new Promise(function (resolve, reject) {
        var b = browserify(infile);
        return b
        // not in npm, don't need in browser
        .exclude('ringo/httpclient')
        .transform('babelify', { 
            presets: ["@babel/preset-env", "@babel/preset-react"],
            // @ui5/webcomponents and some of its dependencies are only distributed as ES6 modules.
            // That means that we need babelify to transform them (even though they're not our
            // code) before they get to browserify. See: 
            // https://github.com/babel/babelify#why-arent-files-in-node_modules-being-transformed
            global: true,
            ignore: [/\/node_modules\/(?!@ui5|lit-html\/)/]
        })
        .transform('browserify-css', {
            global: true,
            ignore: [/\/node_modules\/(?!react-date-picker\/)/]
        })
        .bundle()
        .on('error', function (err) {
            console.log('Error while bundling ' + infile);
            console.log(err);
            reject(err)
        })
        // desired output filename to vinyl-source-stream
        .pipe(source(file))
        .pipe(gulp.dest(amigo_js_out_path))
        .on('finish', function () {
            console.log('Finished bundling ' + file);
            resolve();
        })
    });
}

// Compile all JS used in AmiGO and move it to the staging/deployment
// directory.
gulp.task('compile', ['build'], function(){
    return Promise.all(
        us.map(web_compilables, function(file){
            return _client_compile_task(file);
        })
    );
});

// A version of compile that does not care about build--for rapid JS
// development.
gulp.task('compile-js-dev', function(){
    return Promise.all(
        us.map(web_compilables, function(file){
	        return _client_compile_task(file);
        })
    );
});

// Correctly build/deploy/roll out files into working AmiGO
// configuration.
gulp.task('build', shell.task(_run_cmd_list(
	// First, make sure our subservient amigo2 package has what it
	// needs to run at all.
	[
	    'cd ./javascript/npm/amigo2-instance-data && npm install',
	    './install -v'
	]
    ))
);

gulp.task('cache', shell.task(_run_cmd_list(
    ['node ./scripts/amigo-create-base-stats-cache.js']
)));

///
/// GOlr operations and handling.
///

gulp.task('golr-purge', shell.task(_run_cmd(
    [owltools_runner,
     '--solr-url ', golr_private_url,
     '--solr-purge']
)));

gulp.task('golr-schema', shell.task(_run_cmd(
    [owltools_runner,
     '--solr-config', metadata_string,
     '--solr-schema-dump',
     '|',
     './golr/tools/remove-schema-cruft.pl',
     '>',
     './golr/solr/conf/schema.xml']
)));

// WARNING: Only useful for /some/ Ubuntu/Debian installations.
gulp.task('golr-install', shell.task(_run_cmd_list(
    //'sudo ./golr/tools/golr.el' // Done with this.
    ['sudo mkdir -p /srv/solr/data',
     'sudo mkdir -p /srv/solr/conf',
     // The now two jetty config ops:
     'sudo cp ./golr/solr/solr.war /var/lib/jetty8/webapps/solr.war',
     'sudo cp ./golr/jetty/jetty /etc/default/jetty8',
     //'sudo cp ./golr/jetty/jetty.conf /etc/jetty/jetty.conf',
     //'sudo cp ./golr/jetty/jetty-rewrite.xml /etc/jetty/jetty-rewrite.xml',
     //'sudo cp ./golr/jetty/jetty.xml /etc/jetty/jetty.xml',
     //'sudo cp ./golr/jetty/no_access.html /var/lib/jetty/webapps/root/no_access.html',
     'sudo cp ./golr/solr/conf/schema.xml /srv/solr/conf/schema.xml',
     'sudo cp ./golr/solr/conf/solrconfig.xml /srv/solr/conf/solrconfig.xml',
     'sudo chown jetty /var/lib/jetty8/webapps/solr.war',
     'sudo chgrp adm /var/lib/jetty8/webapps/solr.war',
     'sudo chown -R jetty /srv/solr/',
     'sudo chgrp -R adm /srv/solr/',
     'sudo /etc/init.d/jetty8 stop',
     'sudo /etc/init.d/jetty8 start']
)));

gulp.task('check-ontology-data', shell.task(_run_cmd(
    [owltools_runner,
     ontology_string,
     owltools_ops_flags,
     '--ontology-pre-check']
)));

gulp.task('load-ontology', shell.task(_run_cmd(
    [owltools_runner,
     ontology_string,
     owltools_ops_flags,
     '--solr-url', golr_private_url,
     '--solr-config', ontology_metadata,
     '--solr-log', solr_load_log,
     '--solr-load-ontology',
     '--solr-load-ontology-general']
)));

// Try and load a single ontology safely, with no timing gaps.
// Use case NEO.
gulp.task('load-ontology-purge-safe', shell.task(_run_cmd(
    [owltools_runner,
     ontology_string,
     owltools_ops_flags,
     '--ontology-pre-check',
     '--solr-url', golr_private_url,
     '--solr-config', ontology_metadata,
     '--solr-log', solr_load_log,
     '--solr-purge',
     '--solr-load-ontology',
     '--solr-load-ontology-general']
)));

gulp.task('load-gafs', shell.task(_run_cmd(
    [owltools_runner,
     ontology_string,
     owltools_ops_flags,
     '--solr-url', golr_private_url,
     '--solr-log', solr_load_log,
     '--solr-load-gafs', gaf_string]
)));

gulp.task('load-gafs-with-panther', shell.task(_run_cmd(
    [owltools_runner,
     ontology_string,
     owltools_ops_flags,
     '--solr-url', golr_private_url,
     '--solr-log', solr_load_log,
     // PANTHER (reading--annotations need them too)
     '--read-panther', panther_file_path,
     '--solr-load-gafs', gaf_string]
)));

gulp.task('load-panther', shell.task(_run_cmd(
    [owltools_runner,
     ontology_string,
     owltools_ops_flags,
     '--solr-url', golr_private_url,
     '--solr-log', solr_load_log,
     '--read-panther', panther_file_path,
     '--solr-load-panther',
     '--solr-load-panther-general']
)));

gulp.task('load-models-all', shell.task(_run_cmd(
    [owltools_runner,
     ontology_string,
     owltools_ops_flags,
     '--remove-equivalent-to-nothing-axioms', // roll out more generally?
     '--solr-url', golr_private_url,
     '--solr-log', solr_load_log,
     //'--read-lego-catalogs', catalog_file,
     '--read-model-folder', noctua_file_path,
     '--read-model-url-prefix', noctua_model_prefix,
     '--solr-load-models'
    ]
)));

gulp.task('load-optimize', shell.task(_run_cmd(
    [owltools_runner,
     '--solr-url', golr_private_url,
     '--solr-optimize']
)));

// A minimal working set with some of the more exotic stuff hanging
// on (no opt).
gulp.task('load-most', shell.task(_run_cmd(
    [owltools_runner,
     ontology_string,
     owltools_ops_flags,
     // General config.
     '--solr-url', golr_private_url,
     '--solr-log', solr_load_log,
     // Ontology.
     '--solr-config', ontology_metadata,
     '--solr-load-ontology',
     '--solr-load-ontology-general',
     // PANTHER (reading--annotations need them too)
     '--read-panther', panther_file_path,
     // GAFs
     '--solr-load-gafs', gaf_string
    ]
)));

// TODO: Still need to add models.
gulp.task('load-all', shell.task(_run_cmd(
    [owltools_runner,
     ontology_string,
     owltools_ops_flags,
     // General config.
     '--solr-url', golr_private_url,
     '--solr-log', solr_load_log,
     // Ontology.
     '--solr-config', ontology_metadata,
     '--solr-load-ontology',
     '--solr-load-ontology-general',
     // PANTHER (reading--annotations need them too)
     '--read-panther', panther_file_path,
     // GAFs
     '--solr-load-gafs', gaf_string,
     // PANTHER (loading their own doc types)
     '--solr-load-panther',
     '--solr-load-panther-general',
     // Optimize.
     '--solr-optimize']
)));

gulp.task('message-load-start', shell.task(_run_cmd_list(
    ['./scripts/global-message.pl -e "GOlr is currently being reloaded (started at ' + date + ' on ' + time + '). Any results will be partial at best--please check back later."']
)));

gulp.task('message-load-clear', shell.task(_run_cmd_list(
    ['./scripts/global-message.pl -c']
)));

gulp.task('clean-load-log', shell.task(_run_cmd_list(
    ['echo -n "" > ' + solr_load_log]
)));

///
/// Development.
///

// Rerun tasks when a file changes.
gulp.task('watch-js', function(cb) {
    //gulp.watch(web_compilables, ['compile-js-dev']);
    gulp.watch(us.map(web_compilables,
		      function(file){ return amigo_js_dev_path + '/'+file; } ),
	       ['compile-js-dev']);
    cb(null);
});

// Clean out stuff. There needs to be a "-x" to actually run.
gulp.task('clean-filesystem', shell.task(_run_cmd_list(
    ['./scripts/blank-kvetch.pl',
     './scripts/clean-filesystem.pl -v -s',
     './scripts/clean-filesystem.pl -v -c',
     './scripts/clean-filesystem.pl -v -r']
)));

// W3C HTML and CSS validation.
// WARNING: This is currently hard-wired to the BETA instance.
// CSS is currently valid, so dropping --css flag for now.
gulp.task('w3c-validate', shell.task(_run_cmd_list(
    ['./scripts/w3c-validate.pl -v --html']
)));

///
/// Versioning and publishing.
///

// Release tools for patch release.
gulp.task('release', ['install', // compile and roll out files and js templates
		      'publish-npm', // put to
		      'patch-bump', // bump the main amigo
		      'sync-package-version']); // bump the subordinates

// TODO
gulp.task('publish-npm', function(cb) {
    var npm = require("npm");
    npm.load(function(er, npm) {
	// NPM
	//    npm.commands.publish();
    });
    cb(null);
});

gulp.task('patch-bump', function(cb) {
    gulp.src('./package.json')
	.pipe(bump({
	    type: 'patch'
	}))
	.pipe(gulp.dest('./'));
    cb(null);
});

// Make sure that the instance data takes the same version as the
// install.
gulp.task('sync-package-version', function(cb) {

    var a_ver = require('./package.json').version;

    var to_sync = ['./javascript/npm/amigo2-instance-data/',
		   './javascript/npm/bbop-widget-set/'];

    us.each(to_sync, function(pkg_path){
	gulp.src(pkg_path + 'package.json')
	    .pipe(bump({
		version: a_ver
	    }))
	    .pipe(gulp.dest(pkg_path));
    });
    cb(null);
});

///
/// DEBUG.
///

// Use as: gulp buffer-check > /tmp/foo.txt
gulp.task('buffer-check', shell.task(_run_cmd_list(
    //['perl -e "for (0..1600000){ print STDOUT \\"0123456789\\n\\";}"'] // fail
    ['perl -e "for (0..1500000){ print STDOUT \\"0123456789\\n\\";}"'] // okay
)));

///
/// Runner.
///

// Run the local-only/embedded testing server.
gulp.task('run-amigo', shell.task(_run_cmd_list(
    ['perl -I./perl/bin/ -I./perl/lib/ scripts/amigo-runner']
)));

///
/// Trying out possible approach to AmiGO JSON API.
///

// Use the GOLR_URL environmental variable if available.
var amigo_api_golr = golr_public_url;
if( process && process.env && process.env['GOLR_URL'] ){
    amigo_api_golr = process.env['GOLR_URL'];
}

gulp.task('run-amigo-api', shell.task(_run_cmd([
    'node', './bin/amigo.js',
    '-g', amigo_api_golr,
    '-p', amigo_api_port
])));

// Quick restart development for AmiGO JSON API.
gulp.task('develop-amigo-api', function(){
    //console.log(server_restarter);
    server_restarter.listen({path: './bin/amigo.js',
			     args: ['-g', amigo_api_golr,
				    '-p', amigo_api_port],
			     successMessage: /started/,
			     }, function(err){
				 if( err ){
				     console.log('Gulp startup error:', err);
				 }
			     });
    // Restart server if changed.
    gulp.watch( ['./bin/amigo.js'], function(){
	//console.log(server_restarter);
	server_restarter.restart();
    });
});

///
/// Default.
///

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['install', 'tests', 'docs']);

///
/// Old Makefile that has not yet been transferred.
///

// ####
// #### Testing and release procedures for AmiGO JS.
// ####
// #### A report-mistakes-only testing run can be done as:
// ####   make test | grep -i fail
// ####

// BBOP_JS ?= ../bbop-js/

// ###
// ### Just the exit code results of the tests.
// ###

// .PHONY: pass
// pass:
// 	node ./node_modules/.bin/gulp test | grep -i fail; test $$? -ne 0

// ###
// ### Create exportable JS NPM directory.
// ###

// .PHONY: npm
// npm: bundle
// 	./scripts/release-npm.pl -v -i javascript/staging/amigo2.js -o javascript/npm/amigo2 -r $(AMIGO_VERSION)
// 	npm publish javascript/npm/amigo2
// 	make patch-incr
// ## Was before npm publish, no longer used: https://www.npmjs.org/doc/cli/npm-unpublish.html
// #	npm unpublish amigo2@$(AMIGO_VERSION)

// ###
// ### Copy in some dummy values for use with testing.
// ###

// .PHONY: dummy
// dummy:
// 	cp conf/.dummy_values.yaml conf/amigo.yaml

// ###
// ### Release: docs and bundle; then do an upload.
// ###

// .PHONY: release
// release: bundle npm docs
// #	s3cmd -P put javascript/staging/amigo*.js s3://bbop/jsapi/

// ###
// ### Ctags file for development.
// ### Only sensible when used in a dev environment with bbop-js nearby.
// ###

// .PHONY: tags
// tags:
// 	@echo "Using BBOP-JS at: $(BBOP_JS)"
// 	rm -f TAGS
// 	find ./perl/lib ./javascript/lib/amigo $(BBOP_JS)/lib/bbop | grep ".*\.\(js\|pm\)$$" | xargs ctags -e -a

// ###
// ### Refresh the bundle in BBOP JS and install.
// ### Copy the bundle over for easy use by our tests.
// ### Only sensible when used in a dev environment with bbop-js nearby.
// ###

// .PHONY: refresh
// refresh: tags bundle
// 	@echo "Using BBOP-JS at: $(BBOP_JS)"
// 	cd $(BBOP_JS); make bundle
// 	cp $(BBOP_JS)/staging/bbop.js ./external
// 	cp ./javascript/lib/amigo/data/*.js $(BBOP_JS)/_data
// 	cp ./javascript/lib/amigo/data/golr.js $(BBOP_JS)/demo/
// 	./install -v -g -V $(AMIGO_VERSION)
// 	./scripts/blank-kvetch.pl
