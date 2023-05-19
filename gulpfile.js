////
//// gulpfile.js for AmiGO.
////
//// Comprehensive for more flexible programmatic replacement for
//// Makefile (which depended to much on weird hard-coded chains of
//// ENV vars).
////
//// Usage: npm install && node ./node_modules/.bin/gulp doc|build|test|watch|clean
////

var { spawn } = require('child_process');
var us = require('underscore');
var { dest, parallel, src, series, watch } = require('gulp');
var bump = require('gulp-bump');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var yaml = require('yamljs');
var tilde = require('expand-home-dir');
var request = require('request');
var server_restarter = require('gulp-develop-server');

///
/// Helpers.
///

function _die(str) {
    console.error(str);
    process.exit(-1);
}

// Ping server; used during certain commands.
function _ping_count(){
    if (count_url && typeof(count_url) === 'string' && count_url !== '') {
        request({url: count_url}, function(error, response, body) {
            if (error || response.statusCode !== 200) {
                console.log('Unable to ping: ' + count_url);
            } else {
                console.log('Pinged: ' + count_url);
            }
        });
    } else {
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
    if (typeof(thing) === 'string') {
        if (thing === 'true') {
            ret = true;
        } else if (thing === '1') {
            ret = true;
        }
    } else if (typeof(thing) === 'number') {
        if (thing === 1) {
            ret = true;
        }
    }
    return ret;
}

function spawn_promise(command) {
    // Use child_process.spawn here to get automatic stdio sharing. However,
    // util.promisify does not work with child_process.spawn so we need to
    // make our own Promise wrapper.
    return new Promise(function(resolve, reject) {
        var cmd = spawn(command, { shell: true, stdio: 'inherit' });
        cmd.on('error', reject);
        cmd.on('exit', function(code, signal) {
            if (code !== null && code > 0) {
                return reject('Command `' + command + '` exited with code: ' + code)
            }
            if (signal !== null) {
                return reject('Command `' + command + '` exited with signal: ' + signal)
            }
            resolve()
        })
    });
}
async function shell(commands) {
    if (typeof commands === 'string') {
        commands = [commands]
    }
    for (var command of commands) {
        console.log(command)
        await spawn_promise(command)
    }    
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
if (!a) {
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
var count_url = 'https://s3-us-west-1.amazonaws.com/go-amigo-usage-master/ping.json';
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
var owltools_ops_flags = all_owltools_ops_flags_list.join(' ').replace(/ +/g, ' ');

// Verbosity.
//console.log('AmiGO version: ' + amigo_version);
console.log('AmiGO location: ' + amigo_url);
console.log('GOlr (private loading) location: ' + golr_private_url);
console.log('OWLTools invocation: ' + owltools_runner + ' ' + owltools_ops_flags + '');
//console.log('Ontologies: ' + ontology_string);
//console.log('Ontology metadata: ' + ontology_metadata);

// Execute counter.
_ping_count();

///
/// Tests (async).
///

function test_meta() {
    var cmds = metadata_list.map(function (path) {
        return `kwalify -f ./scripts/schema.yaml ${path} | grep INVALID; test $? -ne 0`;
    });
    return shell(cmds)
}

function test_perl() {
    var cmds = paths['tests-perl'].map(function (path) {
        return `perl -I ./perl/lib/ ${path}`;
    });
    return shell(cmds)
}

function test_js() {
    var cmds = paths['tests-js'].map(function (path) {
        return `rhino -modules external/bbop.js -modules javascript/staging/amigo2.js -opt -1 -f ${path} | grep -i fail; test $? -ne 0'`;
    });
    return shell(cmds)
}

function test_app() {
    return shell([
        'bash -c "source ./test-app/behave/bin/activate && TARGET=' + amigo_url + ' BROWSER=phantomjs behave ./test-app/behave/"',
        //'bash -c "source ./test-app/behave/bin/activate && TARGET=' + amigo_url + ' BROWSER=firefox behave ./test-app/behave/*.feature"'
    ]);
}

var tests = parallel(test_meta, test_perl, test_js, test_app);

///
/// Docs.
///

function docs() {
    return shell([
        //'naturaldocs --rebuild-output --input ./javascript/lib/amigo --project javascript/docs/.naturaldocs_project/ --output html javascript/docs',
        'naturaldocs --rebuild-output --input ./perl/lib/ --project perl/docs/.naturaldocs_project/ --output html perl/docs',
    ]);
}

///
/// AmiGO install.
///

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
    'ModelDetails.js',
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

    var infile = amigo_js_dev_path + '/' + file;
    //var outfile = amigo_js_out_path + '/' +file;

    return new Promise(function (resolve, reject) {
        console.log('Bundling ' + file + '...')
        var b = browserify(infile);
        return b
            // not in npm, don't need in browser
            .exclude('ringo/httpclient')
            .transform('babelify', { 
                presets: ["@babel/preset-env"],
                // Some dependencies are only distributed as ES6 modules. That means that we need
                // babelify to transform them (even though they're not our code) before they get 
                // bundled by browserify. See: 
                // https://github.com/babel/babelify#why-arent-files-in-node_modules-being-transformed
                global: true,
                ignore: [/\/node_modules\/(?!@geneontology|@stencil\/)/]
            })
            .transform('brfs')
            .transform('loose-envify', {
                GO_API_URL: a['GO_API_URL'].value,
            })
            .bundle()
            .on('error', function (err) {
                console.log('Error while bundling ' + file);
                console.log(err);
                reject(err)
            })
            // desired output filename to vinyl-source-stream
            .pipe(source(file))
            .pipe(dest(amigo_js_out_path))
            .on('finish', function () {
                console.log('Finished bundling ' + file);
                resolve();
            })
    });
}

// A version of compile that does not care about build--for rapid JS
// development.
function compile_js_dev() {
    return Promise.all(
        us.map(web_compilables, function(file) {
            return _client_compile_task(file);
        })
    );
}

// Correctly build/deploy/roll out files into working AmiGO
// configuration.
function build() {
    return shell([
        // First, make sure our subservient amigo2 package has what it
        // needs to run at all.
        'cd ./javascript/npm/amigo2-instance-data && npm install',
        './install -v',
    ]);
}

var compile = series(build, compile_js_dev);
var install = series(compile);

function cache() {
    return shell('node ./scripts/amigo-create-base-stats-cache.js');
}

///
/// GOlr operations and handling.
///

function golr_purge() {
    return shell(`${owltools_runner} --solr-url ${golr_private_url} --solr-purge`);
}

function golr_schema() {
    return shell(`${owltools_runner} --solr-config ${metadata_string} --solr-schema-dump | ./golr/tools/remove-schema-cruft.pl > ./golr/solr/conf/schema.xml`);
}

// WARNING: Only useful for /some/ Ubuntu/Debian installations.
function golr_install() { 
    return shell([
        //'sudo ./golr/tools/golr.el' // Done with this.
        'sudo mkdir -p /srv/solr/data',
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
        'sudo /etc/init.d/jetty8 start',
    ]);
}

function check_ontology_data() { 
    return shell(`${owltools_runner} ${ontology_string} ${owltools_ops_flags} --ontology-pre-check`);
}

function load_ontology() {
    return shell(
        `${owltools_runner} ${ontology_string} ${owltools_ops_flags} \
            --solr-url ${golr_private_url} \
            --solr-config ${ontology_metadata} \
            --solr-log ${solr_load_log} \
            --solr-load-ontology \
            --solr-load-ontology-general`
    );
}

// Try and load a single ontology safely, with no timing gaps.
// Use case NEO.
function load_ontology_purge_safe() {
    return shell(
        `${owltools_runner} ${ontology_string} ${owltools_ops_flags} \
            --ontology-pre-check \
            --solr-url ${golr_private_url} \
            --solr-config ${ontology_metadata} \
            --solr-log' ${solr_load_log} \
            --solr-purge \
            --solr-load-ontology \
            --solr-load-ontology-general`
    );
}

function load_gafs() {
    return shell(
        `${owltools_runner} ${ontology_string} ${owltools_ops_flags} \
            --solr-url ${golr_private_url} \
            --solr-log ${solr_load_log} \
            --solr-load-gafs ${gaf_string}`
    );
}

function load_gafs_with_panther() {
    return shell(
        `${owltools_runner} ${ontology_string} ${owltools_ops_flags} \
            --solr-url ${golr_private_url} \
            --solr-log' ${solr_load_log} \
            --read-panther ${panther_file_path} \
            --solr-load-gafs ${gaf_string}`
    );
}

function load_panther() {
    return shell(
        `${owltools_runner} ${ontology_string} ${owltools_ops_flags} \
            --solr-url ${golr_private_url} \
            --solr-log ${solr_load_log} \
            --read-panther ${panther_file_path} \
            --solr-load-panther \
            --solr-load-panther-general`
    );
}

function load_models_all() {
    return shell(
        `${owltools_runner} ${ontology_string} ${owltools_ops_flags} \
            --remove-equivalent-to-nothing-axioms' \
            --solr-url ${golr_private_url} \
            --solr-log ${solr_load_log} \
            --read-model-folder ${noctua_file_path} \
            --read-model-url-prefix ${noctua_model_prefix} \
            --solr-load-models`
    );
}

function load_optimize() {
    return shell(`${owltools_runner} --solr-url ${golr_private_url} --solr-optimize`);
}

// A minimal working set with some of the more exotic stuff hanging
// on (no opt).
function load_most() {
    return shell(
        `${owltools_runner} ${ontology_string} ${owltools_ops_flags} \
            --solr-url ${golr_private_url} \
            --solr-log ${solr_load_log} \
            --solr-config ${ontology_metadata} \
            --solr-load-ontology \
            --solr-load-ontology-general \
            --read-panther ${panther_file_path} \
            --solr-load-gafs ${gaf_string}`
    );
}

// TODO: Still need to add models.
function load_all() {
    return shell(
        `${owltools_runner} ${ontology_string} ${owltools_ops_flags} \
            --solr-url ${golr_private_url} \
            --solr-log ${solr_load_log} \
            --solr-config ${ontology_metadata} \
            --solr-load-ontology \
            --solr-load-ontology-general \
            --read-panther ${panther_file_path} \
            --solr-load-gafs ${gaf_string} \
            --solr-load-panther \
            --solr-load-panther-general \
            --solr-optimize`
    );
}

function message_load_start() {
    return shell('./scripts/global-message.pl -e "GOlr is currently being reloaded (started at ' + date + ' on ' + time + '). Any results will be partial at best--please check back later."');
}

function message_load_clear() {
    return shell('./scripts/global-message.pl -c');
}

function clean_load_log() {
    return shell('echo -n "" > ' + solr_load_log);
}

///
/// Development.
///

// Rerun tasks when a file changes.
function watch_js() {
    const watcher = watch(web_compilables, { cwd: amigo_js_dev_path });
    watcher.on('all', function (event_name, path) {
        return _client_compile_task(path);
    });
}

// Clean out stuff. There needs to be a "-x" to actually run.
function clean_filesystem() {
    return shell([
        './scripts/blank-kvetch.pl',
        './scripts/clean-filesystem.pl -v -s',
        './scripts/clean-filesystem.pl -v -c',
        './scripts/clean-filesystem.pl -v -r'
    ]);
}

// W3C HTML and CSS validation.
// WARNING: This is currently hard-wired to the BETA instance.
// CSS is currently valid, so dropping --css flag for now.
function w3c_validate() {
    return shell('./scripts/w3c-validate.pl -v --html');
}

///
/// Versioning and publishing.
///

// TODO
function publish_npm(cb) {
    var npm = require("npm");
    npm.load(function(er, npm) {
    // NPM
    //    npm.commands.publish();
    });
    cb(null);
}

function patch_bump(cb) {
    src('./package.json')
        .pipe(bump({
            type: 'patch'
        }))
        .pipe(dest('./'));
    cb(null);
}

// Make sure that the instance data takes the same version as the
// install.
function sync_package_version(cb) {

    var a_ver = require('./package.json').version;

    var to_sync = [
        './javascript/npm/amigo2-instance-data/',
        './javascript/npm/bbop-widget-set/'
    ];

    us.each(to_sync, function(pkg_path) {
        src(pkg_path + 'package.json')
            .pipe(bump({
                version: a_ver
            }))
        .pipe(dest(pkg_path));
    });
    cb(null);
}

///
/// DEBUG.
///

// Use as: gulp buffer-check > /tmp/foo.txt
function buffer_check() {
    return shell([
        //'perl -e "for (0..1600000){ print STDOUT \\"0123456789\\n\\";}"' // fail
        'perl -e "for (0..1500000){ print STDOUT \\"0123456789\\n\\";}"' // okay
    ]);
}

///
/// Runner.
///

// Run the local-only/embedded testing server.
function run_amigo() {
    return shell('perl -I./perl/bin/ -I./perl/lib/ scripts/amigo-runner');
}

///
/// Trying out possible approach to AmiGO JSON API.
///

// Use the GOLR_URL environmental variable if available.
var amigo_api_golr = golr_public_url;
if( process && process.env && process.env['GOLR_URL'] ){
    amigo_api_golr = process.env['GOLR_URL'];
}

function run_amigo_api() {
    return shell(`node ./bin/amigo.js -g ${amigo_api_golr} -p ${amigo_api_port}`);
}

// Quick restart development for AmiGO JSON API.
function develop_amigo_api() {
    //console.log(server_restarter);
    server_restarter.listen({
        path: './bin/amigo.js',
        args: [
            '-g', amigo_api_golr,
            '-p', amigo_api_port
        ],
        successMessage: /started/,
    }, function(err) {
        if (err) {
            console.log('Gulp startup error:', err);
        }
    });
    // Restart server if changed.
    watch(['./bin/amigo.js'], function() {
        //console.log(server_restarter);
        server_restarter.restart();
    });
}

module.exports = {
    'test-meta': test_meta,
    'test-perl': test_perl,
    'test-js': test_js,
    'test-app': test_app,
    tests,

    docs,

    'compile-js-dev': compile_js_dev,
    build,
    compile,
    install,

    cache,

    'golr-purge': golr_purge,
    'golr-schema': golr_schema,
    'golr-install': golr_install,
    'check-ontology-data': check_ontology_data,
    'load-ontology': load_ontology,
    'load-ontology-purge-safe': load_ontology_purge_safe,
    'load-gafs': load_gafs,
    'load-gafs-with-panther': load_gafs_with_panther,
    'load-panther': load_panther,
    'load-models-all': load_models_all,
    'load-optimize': load_optimize,
    'load-most': load_most,
    'load-all': load_all,
    'message-load-start': message_load_start,
    'message-load-clear': message_load_clear,
    'clean-load-log': clean_load_log,

    'watch-js': watch_js,
    'clean-filesystem': clean_filesystem,
    'w3c-validate': w3c_validate,

    'publish-npm': publish_npm,
    'patch-bump': patch_bump,
    'sync-package-version': sync_package_version,
    release: series(install, publish_npm, patch_bump, sync_package_version),

    'buffer-check': buffer_check,

    'run-amigo': run_amigo,
    'run-amigo-api': run_amigo_api,
    'develop-amigo-api': develop_amigo_api,

    default: series(install, tests, docs)
}

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
