var gulp = require('gulp-param')(require('gulp'), process.argv),
    util = require('gulp-util'),
    bump = require('gulp-bump'),
    fs = require('fs'),
    merge = require('merge-stream'),
    path = require('path'),
    glob = require('glob'),
    _ = require('underscore'),
    inject = require('gulp-inject'),
    less = require('gulp-less'),
    buster = require('gulp-buster'),
    replace = require('gulp-replace'),
    del = require('del'),
    watch = require('gulp-watch'),
    karma = require('gulp-karma'),
    plato = require('plato'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    jedit = require('gulp-json-editor'),
    ngAnnotate = require('gulp-ng-annotate'),
    ngdoc = require('gulp-ngdocs'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    minifyHtml = require('gulp-minify-html'),
    html2js = require('gulp-html2js'),
    series = require('stream-series'),
    esprima = require('esprima'),
    watch = require('gulp-watch'),
    rename = require('gulp-rename')
    ;





var getInjectPrefix = function(targetFile) {
    var levels = targetFile.replace(/^\.?\//,'').split('/').length-1;
    var prefix = '';
    for (var i=0; i<levels; ++i)
        prefix += '../';
    return prefix;
};


var injectIntoIndex = function(srcArray, starttag, targetFile, hashes) {

    if (!srcArray || !srcArray.length)
        return util.noop();

    var streamArray = _.map(srcArray, function(glob){
        return gulp.src(glob, {read:false});
    });

    var orderedStream = series.apply(this, streamArray);

    var prefix = getInjectPrefix(targetFile);

    return inject(orderedStream, {
        read : false,
        starttag : starttag,
        transform : function (filepath) {

            var buildDir = 'build/';
            var relativePath = filepath.substring(filepath.indexOf(buildDir)+buildDir.length);
            var normalizedPath = buildDir+relativePath;
            var extension = path.extname(filepath);


            var hash = hashes && hashes[normalizedPath];


            if (extension === '.js')
                return '<script src="'+prefix+relativePath+(hash ? '?v='+hash : '')+'"></script>';
            if (extension === '.css')
                return '<link rel="stylesheet" href="'+prefix+relativePath+(hash ? '?v='+hash : '')+'">';
        }
    });
};




var getModuleDirectDependencies = function(moduleName){
    var getArray = function (node) {
        if (node.type==='ArrayExpression')
            return _.pluck(node.elements, 'value');

        var res;
        if (_.isObject(node) || _.isArray(node))
            _.forEach(node, function(child){
                if (res)
                    return;
                res = getArray(child);
            });
        return res;
    };
    var moduleSrc = fs.readFileSync('./src/modules/' + moduleName + '/module.js', 'utf8');
    var tree = esprima.parse(moduleSrc);

    return getArray(tree);
};

var moduledepMap = {};
var getModuleDependencies = function(moduleName){

    if (moduledepMap[moduleName])
        return moduledepMap[moduleName];

    var stack = [moduleName];
    var res = [];
    while (stack.length) {
        var curModule = stack.pop();

        if (!_.contains(res, curModule))
            res.push(curModule);

        var dirDeps = getModuleDirectDependencies(curModule);
        for (var i=0; i<dirDeps.length; ++i) {
            if (_.contains(res, dirDeps[i]) || _.contains(stack, dirDeps[i]) || !fs.existsSync('./src/modules/'+dirDeps[i]+'/module.js'))
                continue;
            stack.push(dirDeps[i]);
        }
    }
    moduledepMap[moduleName] = res;
    return res;
};




gulp.task('clean', ['jshint'], function(){
    return del.sync(['build']);
});


gulp.task('vendor', ['clean'], function(){
    return gulp.src(['src/vendor/**'])
        .pipe(gulp.dest('build/vendor'));
});

gulp.task('assets', ['clean'], function(){
    return gulp.src(['src/assets/**'])
        .pipe(gulp.dest('build/assets'));
});


gulp.task('less', ['clean'],function(){
    return gulp.src([
        'src/modules/**/*.less'
    ])
        .pipe(less())
        .pipe(gulp.dest('build/modules'));
});


gulp.task('js', ['clean'],function(){

    return gulp.src([
        '!./**/*.test.js',
        'src/modules/**/*.js'
    ])
        .pipe(ngAnnotate())
        .pipe(gulp.dest('build/modules'));

});



gulp.task('template-list', ['js'], function(){


    var process = function(appModule, targetFile) {

        var prefix = getInjectPrefix(targetFile);
        //console.log();

        var deps = getModuleDependencies(appModule);

        var entries = [],
            keys = [],
            files = glob.sync('./src/modules/@('+deps.join('|')+')/**/*.html');

        _.forEach(files, function(filePath){
            var dir = 'src/';
            var relativePath = filePath.substring(filePath.indexOf(dir)+dir.length);

            var arr = relativePath.split('/');

            var module = arr[1];
            var templ = arr[arr.length-1].replace('.html', '');

            var key = module + "_" + templ;

            key = key.toUpperCase();

            if (_.contains(keys, key)) {
                throw "Template key collision: more than one template with key '"+key+"'";
            }
            keys.push(key);
            entries.push("  " + key + " : '" + prefix + relativePath + "'");
        });



        return gulp.src('src/_templ.js')
            .pipe(replace('/*##TEMPLATE_LIST##*/', entries.join(',\n')))
            .pipe(replace('##MODULE##', appModule))
            .pipe(replace('##UPPER_MODULE##', appModule.toUpperCase()))
            .pipe(rename('T_'+appModule.toUpperCase()+'.js'))
            .pipe(gulp.dest('build/modules/'+appModule+'/constants'));
    };


    var meta = require('./src/meta.json');
    var streams = [];

    _.forEach(meta.apps, function(app){

        streams.push(process(app.module, app.index));
    });

    return merge.apply(this, streams);

});

gulp.task('meta', ['js'], function(){

    var metaJson = fs.readFileSync('src/meta.json', 'utf8');
    return gulp.src('build/modules/_meta/module.js')
        .pipe(replace('{/*##META_JSON##*/}', metaJson))
        .pipe(gulp.dest('build/modules/_meta'));

});

gulp.task('templates', ['clean'],function(){

    return gulp.src([
        'src/modules/**/*.html'
    ]).pipe(gulp.dest('build/modules'));

});

gulp.task('index', ['vendor', 'assets', 'less', 'templates', 'meta', 'template-list', 'js'],function(){


    var buildAppIndex = function(appModule, targetFile) {



        var deps = getModuleDependencies(appModule);

        var src = [
            './build/modules/@('+deps.join('|')+')/*.css',
            './build/modules/@('+deps.join('|')+')/**/*.css',
            './build/modules/@('+deps.join('|')+')/module.js',              // first all the module definitions
            './build/modules/@('+deps.join('|')+')/**/!(module).js'         // then all the module js files
        ];



        var meta = require('./src/meta.json');
        var vendor = _.where(meta.apps, { module : appModule})[0].vendor;

        var otherMains = _.without(_.pluck(meta.apps, 'module'), appModule);
        otherMains = _.intersection(otherMains, deps);
        _.forEach(otherMains, function(otherMain){
            var otherVendor =  _.where(meta.apps, { module : otherMain})[0].vendor;
            vendor.head.dev = _.uniq(vendor.head.dev.concat(otherVendor.head.dev));
            vendor.head.prod = _.uniq(vendor.head.prod.concat(otherVendor.head.prod));
            vendor.body.dev = _.uniq(vendor.body.dev.concat(otherVendor.body.dev));
            vendor.body.prod = _.uniq(vendor.body.prod.concat(otherVendor.body.prod));
        });


        return gulp.src('src/index.html')
            .pipe(rename(targetFile))
            .pipe(replace('##APP_MAIN_MODULE##', appModule))
            .pipe(injectIntoIndex(src, '<!-- inject:{{ext}} -->', targetFile))
            .pipe(injectIntoIndex(vendor.head.dev, '<!-- vendor:head:{{ext}} -->', targetFile))
            .pipe(injectIntoIndex(vendor.body.dev, '<!-- vendor:body:{{ext}} -->', targetFile))

            .pipe(gulp.dest('build'));
    };


    var meta = require('./src/meta.json');
    var streams = [];

    _.forEach(meta.apps, function(app){
        streams.push(buildAppIndex(app.module, app.index));
    });

    return merge.apply(this, streams);

});


gulp.task('meta-align', ['js'], function(){
    var meta = JSON.parse(fs.readFileSync('src/meta.json', 'utf8'));
    var bowerMeta = _.pick(meta, ['name', 'version', 'description', 'license', 'homepage']);
    var nodeMeta = _.pick(meta, ['name', 'version', 'description', 'license', 'repository']);

    var bowerStream = gulp.src('bower.json')
        .pipe(jedit(bowerMeta))
        .pipe(gulp.dest('.'));

    var nodeStream = gulp.src('package.json')
        .pipe(jedit(nodeMeta))
        .pipe(gulp.dest('.'));

    return merge(bowerStream, nodeStream);
});



gulp.task('build', ['clean', 'index', 'vendor', 'less', 'templates', 'template-list', 'js']);


gulp.task('dev', ['build', 'meta-align', 'ngdoc', 'karma']);


// ============================= TEST =============================== //


gulp.task('karma', ['build'],function(){

    var meta = require('./src/meta.json');
    var vendor = _.where(meta.apps, { module : 'main'})[0].vendor;

    var vendorFiles = vendor.head.dev.concat(vendor.body.dev);

    // keep only .js files
    vendorFiles = _.filter(vendorFiles, function(file){
        return file.match(/\.js$/);
    });

    // transforms ./build in build
    vendorFiles = _.map(vendorFiles, function(file){
        return file.substring(2);
    });


    var testFiles = vendorFiles.concat([
        'build/vendor/angular-mocks/angular-mocks.js',
        'build/modules/*.js',
        'build/modules/**/*.js',
        'build/modules/**/MOCK.test.js', // then, include the mocks provider
        'src/modules/**/*.test.js'       // then, include the test specs
    ]);

    // Be sure to return the stream
    return gulp.src(testFiles, {read:false})
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }))
        .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
        });

});



gulp.task('plato', function() {

    var testFiles = [
        '!src/**/*.test.js', // exclude test js files
        'src/modules/*.js',
        'src/modules/**/*.js'
    ];

    var options = {
            jshint: {
                options: {
                    strict: true
                }
            },
            complexity: {
                trycatch: true
            }
        };

    return plato.inspect(testFiles, './report/complexity', options, function callback(){});

});

gulp.task('jshint', function() {

    var testFiles = [
        '!src/**/*.test.js', // exclude test js files
        'src/modules/*.js',
        'src/modules/**/*.js'
    ];

    return gulp.src(testFiles)
        .pipe(jscs())   // code style check
        .pipe(jshint())
        .pipe(jshint.reporter('cool-reporter'))
        .pipe(jshint.reporter('fail'));
});




//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//
//                                         PROD TASKS
//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//

var minifyJs = function(){
    return uglify({
        mangle : ['angular', 'module'],
        output : {
            indent_start  : 0,     // start indentation on every line (only when `beautify`)
            indent_level  : 4,     // indentation level (only when `beautify`)
            quote_keys    : false, // quote all keys in object literals?
            space_colon   : true,  // add a space after colon signs?
            ascii_only    : false, // output ASCII-safe? (encodes Unicode characters as ASCII)
            inline_script : false, // escape "</script"?
            width         : 80,    // informative maximum line width (for beautified output)
            max_line_len  : 32000, // maximum line length (for non-beautified output)
            beautify      : false, // beautify output?
            source_map    : null,  // output a source map
            bracketize    : false, // use brackets every time?
            comments      : false, // output comments?
            semicolons    : true  // use semicolons to separate statements? (otherwise, newlines)
        },
        compress : {
            sequences     : true,  // join consecutive statemets with the “comma operator”
            properties    : true,  // optimize property access: a["foo"] → a.foo
            dead_code     : true,  // discard unreachable code
            drop_debugger : true,  // discard “debugger” statements
            unsafe        : false, // some unsafe optimizations (see below)
            conditionals  : true,  // optimize if-s and conditional expressions
            comparisons   : true,  // optimize comparisons
            evaluate      : true,  // evaluate constant expressions
            booleans      : true,  // optimize boolean expressions
            loops         : true,  // optimize loops
            unused        : true,  // drop unused variables/functions
            hoist_funs    : true,  // hoist function declarations
            hoist_vars    : false, // hoist variable declarations
            if_return     : true,  // optimize if-s followed by return/continue
            join_vars     : true,  // join var declarations
            cascade       : true,  // try to cascade `right` into `left` in sequences
            side_effects  : true,  // drop side-effect-free statements
            warnings      : true,  // warn about potentially dangerous optimizations/code
            global_defs   : {}     // global definitions
        }
    });
};

var minifyHtmlOptions = {
    empty : false, // - do not remove empty attributes
    cdata : false, // - do not strip CDATA from scripts
    comments : false, // - do not remove comments
    conditionals : true, // - do not remove conditional internet explorer comments
    spare : false, // - do not remove redundant attributes
    quotes : false, // - do not remove arbitrary quotes
    loose : false // - preserve one whitespace
};


gulp.task('html2js-prod', ['dev'], function(){


    var process = function(appModule, targetFile) {


        var deps = getModuleDependencies(appModule);
        var src = './build/modules/@('+deps.join('|')+')/**/*.html';

        var suffix = targetFile.indexOf('/') ? targetFile.substring(0, targetFile.lastIndexOf('/')) : '';
        var baseDir = 'build' + (suffix.length ? '/'+suffix : '');


        return gulp.src(src)
            .pipe(minifyHtml(minifyHtmlOptions))
            .pipe(html2js({
                outputModuleName : appModule,
                singleModule : true,
                base : baseDir
            }))
            .pipe(concat('templates.min.js'))
            .pipe(gulp.dest('build/modules/'+appModule+'/html2js'));
    };

    var meta = require('./src/meta.json');
    var streams = [];

    _.forEach(meta.apps, function(app){
        streams.push(process(app.module, app.index));
    });

    return merge.apply(this, streams);

});


gulp.task('js-prod', ['html2js-prod', 'dev'], function(){

    var buildAppIndex = function(appModule, targetFile) {


        var src = [];


        var deps = getModuleDependencies(appModule);
        src.push('./build/modules/@('+deps.join('|')+')/module.js');
        src.push('./build/modules/@('+deps.join('|')+')/**/!(module).js');


        return gulp.src(src)
            .pipe(concat(appModule+'.min.js'))
            .pipe(gulp.dest('build/js'))
            .pipe(minifyJs())
            .pipe(gulp.dest('build/js'))
            .pipe(buster())
            .pipe(gulp.dest('.'));
    };


    var meta = require('./src/meta.json');
    var streams = [];

    _.forEach(meta.apps, function(app){
        streams.push(buildAppIndex(app.module, app.index));
    });

    return merge.apply(this, streams);

});


gulp.task('css-prod', ['dev'], function(){

    var process = function(appModule, targetFile) {

        var deps = getModuleDependencies(appModule);

        var src = [
            './build/modules/@('+deps.join('|')+')/**/*.css'
        ];

        return gulp.src(src)
            .pipe(concat(appModule+'.min.css'))
            .pipe(minifyCss())
            .pipe(gulp.dest('build/css'))
            .pipe(buster())
            .pipe(gulp.dest('.'));
    };


    var meta = require('./src/meta.json');
    var streams = [];

    _.forEach(meta.apps, function(app){
        streams.push(process(app.module, app.index));
    });

    return merge.apply(this, streams);

});


gulp.task('index-prod', ['js-prod', 'css-prod', 'dev'],function(){



    var buildAppIndex = function(appModule, targetFile) {

        var src = [
            './build/css/' + appModule + '.min.css',
            './build/js/' + appModule + '.min.js'
        ];

        var deps = getModuleDependencies(appModule);

        var meta = require('./src/meta.json');
        var vendor = _.where(meta.apps, { module : appModule})[0].vendor;

        var otherMains = _.without(_.pluck(meta.apps, 'module'), appModule);
        otherMains = _.intersection(otherMains, deps);
        _.forEach(otherMains, function(otherMain){
            var otherVendor =  _.where(meta.apps, { module : otherMain})[0].vendor;
            vendor.head.dev = _.uniq(vendor.head.dev.concat(otherVendor.head.dev));
            vendor.head.prod = _.uniq(vendor.head.prod.concat(otherVendor.head.prod));
            vendor.body.dev = _.uniq(vendor.body.dev.concat(otherVendor.body.dev));
            vendor.body.prod = _.uniq(vendor.body.prod.concat(otherVendor.body.prod));
        });

        var str = fs.readFileSync('./busters.json', "utf8");
        var hashes = JSON.parse(str);

        return gulp.src('src/index.html')
            .pipe(rename(targetFile))
            .pipe(replace('##APP_MAIN_MODULE##', appModule))
            .pipe(injectIntoIndex(src, '<!-- inject:{{ext}} -->', targetFile, hashes))
            .pipe(injectIntoIndex(vendor.head.dev, '<!-- vendor:head:{{ext}} -->', targetFile, hashes))
            .pipe(injectIntoIndex(vendor.body.dev, '<!-- vendor:body:{{ext}} -->', targetFile, hashes))
            .pipe(minifyHtml(minifyHtmlOptions))
            .pipe(gulp.dest('build'));
    };


    var meta = require('./src/meta.json');
    var streams = [];

    _.forEach(meta.apps, function(app){
        streams.push(buildAppIndex(app.module, app.index));
    });

    return merge.apply(this, streams);


});


gulp.task('prod', ['js-prod', 'css-prod', 'index-prod', 'dev'], function(version){

    del.sync([
        'build/styles',
        'build/modules'
    ]);

    var options = {};
    if (!version) {
        options = {
            preid: 'build',
            type: 'prerelease'
        };
    }
    else if (version.match(/major|minor|patch|prerelease|build/)) {
        options = {
            preid: 'build',
            type: version
        };
    }
    else if (version.match(/\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
        options = {
            version: version
        };
    }
    else {
        throw "--version (-v) should be major|minor|patch|prerelease|build or a Semver version number (e.g. 1.0.2)";
    }

    var curStream = gulp.src(['bower.json', 'package.json'])
        .pipe(bump(options))
        .pipe(gulp.dest('.'));

    var srcStream = gulp.src(['src/meta.json'])
        .pipe(bump(options))
        .pipe(gulp.dest('src'));

    return merge (curStream, srcStream);
});


//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//
//                                     DOCUMENTATION TASKS
//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//


gulp.task('ngdoc', function() {

    var testFiles = [
        '!src/**/*.test.js', // exclude test js files
        'src/modules/*.js',
        'src/modules/**/*.js'
    ];

    return gulp.src(testFiles)
        .pipe(ngdoc.process({
            html5Mode : false
        }))
        .pipe(gulp.dest('docs'));
});




//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//
//                                     WATCH TASKS
//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//

// works in dev mode
gulp.task('watch', ['dev'], function(){

    watch('src/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('build/modules'));

    watch('src/modules/**/*.js')
        .pipe(gulp.dest('build/modules'));

    watch('src/modules/**/*.html')
        .pipe(gulp.dest('build/modules'));

    watch('src/assets/**/*')
        .pipe(gulp.dest('build/assets'));

});




