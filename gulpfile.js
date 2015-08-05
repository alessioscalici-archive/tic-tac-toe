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
    plumber = require('gulp-plumber'),
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



var forEachApp = function(func){
    var meta = JSON.parse(fs.readFileSync('src/meta.json', 'utf8'));
    var streams = [];
    _.forEach(meta.apps, function(app){
        streams.push(func(app));
    });
    return merge.apply(this, streams);
};
var forEachAppNoStream = function(func){
    var meta = JSON.parse(fs.readFileSync('src/meta.json', 'utf8'));
    var res = [];
    _.forEach(meta.apps, function(app){
        res.push(func(app));
    });
    return res;
};



var uglifyOptions = {
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


//####################################################################################################################################//
//                                                          TASK FUNCTIONS
//####################################################################################################################################//



var task = {

    clean : function(){
        return del.sync(['build']);
    },

    vendor : function(){

        var files = [],
            addFiles = function(obj){
                _.forEach(obj, function(path){
                    files.push('src/vendor/*' + path);
                    files.push('src/vendor-static/*' + path);
                });
            };

        forEachAppNoStream(function(app) {
            addFiles(app.vendor.head.dev);
            addFiles(app.vendor.head.prod);
            addFiles(app.vendor.body.dev);
            addFiles(app.vendor.body.prod);
        });

        return gulp.src(files)
            .pipe(gulp.dest('build/vendor'));
    },

    cleanAssets : function(){
        return del.sync(['build/assets/**']);
    },

    assets : function(){
        return gulp.src(['src/assets/**'])
            .pipe(gulp.dest('build/assets'));
    },

    cleanLess : function(){
        return del.sync(['build/modules/**/*.@(css|less)']);
    },

    less : function(){
        return gulp.src('src/modules/**/*.@(css|less)')
            .pipe(plumber())
            .pipe(less())
            .pipe(plumber.stop())
            .pipe(gulp.dest('build/modules'));
    },

    cssProd : function(){
        var process = function(app) {
            var deps = getModuleDependencies(app.module);
            var src = [
                './build/modules/@('+deps.join('|')+')/**/*.css'
            ];
            return gulp.src(src)
                .pipe(concat(app.module+'.min.css'))
                .pipe(minifyCss())
                .pipe(gulp.dest('build/css'))
                .pipe(buster())
                .pipe(gulp.dest('.'));
        };
        return forEachApp(process);
    },

    cleanJs : function(){
        return del.sync(['build/modules/**/!(*.test).js']);
    },

    js : function(){
        return gulp.src('src/modules/**/!(*.test).js')
            .pipe(plumber())
            .pipe(ngAnnotate())
            .pipe(plumber.stop())
            .pipe(gulp.dest('build/modules'));
    },

    jsProd : function(){
        var process = function(app) {
            var deps = getModuleDependencies(app.module);
            var src = [
                './build/modules/@('+deps.join('|')+')/module.js',
                './build/modules/@('+deps.join('|')+')/**/!(module).js'
            ];
            return gulp.src(src)
                .pipe(concat(app.module+'.min.js'))
                .pipe(gulp.dest('build/js'))
                .pipe(uglify(uglifyOptions))
                .pipe(gulp.dest('build/js'))
                .pipe(buster())
                .pipe(gulp.dest('.'));
        };
        return forEachApp(process);
    },

    html2jsProd : function(){
        var process = function(app) {
            var deps = getModuleDependencies(app.module);
            var src = './build/modules/@('+deps.join('|')+')/**/*.html';
            var suffix = app.index.indexOf('/') ? app.index.substring(0, app.index.lastIndexOf('/')) : '';
            var baseDir = 'build' + (suffix.length ? '/'+suffix : '');
            return gulp.src(src)
                .pipe(minifyHtml(minifyHtmlOptions))
                .pipe(html2js({
                    outputModuleName : app.module,
                    singleModule : true,
                    base : baseDir
                }))
                .pipe(concat('templates.min.js'))
                .pipe(gulp.dest('build/modules/'+app.module+'/html2js'));
        };
        return forEachApp(process);
    },


    meta : function(){
        var metaJson = fs.readFileSync('src/meta.json', 'utf8');

        // delete infos about vendors
        var metaObject = JSON.parse(metaJson);
        delete metaObject.apps;
        metaJson = JSON.stringify(metaObject);

        return gulp.src('build/modules/_meta/module.js')
            .pipe(replace('{/*##META_JSON##*/}', metaJson))
            .pipe(gulp.dest('build/modules/_meta'));
    },

    metaAlign : function(){
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
    },


    cleanTemplates : function(){
        return del.sync(['build/modules/**/*.html']);
    },
    templates : function(){
        return gulp.src('src/modules/**/*.html')
            .pipe(gulp.dest('build/modules'));
    },

    templateList : function(){

        var process = function(app) {

            var prefix = getInjectPrefix(app.index);
            var deps = getModuleDependencies(app.module);

            var entries = [],
                keys = [],
                files = glob.sync('./src/modules/@('+deps.join('|')+')/**/*.html');

            _.forEach(files, function(filePath){
                var dir = 'src/',
                    relativePath = filePath.substring(filePath.indexOf(dir)+dir.length),
                    arr = relativePath.split('/'),
                    module = arr[1],
                    templ = arr[arr.length-1].replace('.html', ''),
                    key = (module + "_" + templ).toUpperCase();

                if (_.contains(keys, key)) {
                    throw "Template key collision: more than one template with key '"+key+"'";
                }
                keys.push(key);
                entries.push("  " + key + " : '" + prefix + relativePath + "'");
            });

            return gulp.src('src/_templ.js')
                .pipe(replace('/*##TEMPLATE_LIST##*/', entries.join(',\n')))
                .pipe(replace('##MODULE##', app.module))
                .pipe(replace('##UPPER_MODULE##', app.module.toUpperCase()))
                .pipe(rename('T_'+app.module.toUpperCase()+'.js'))
                .pipe(gulp.dest('build/modules/'+app.module+'/constants'));
        };


        return forEachApp(process);
    },

    index : function(){

        var process = function(app) {

            var deps = getModuleDependencies(app.module);

            var src = [
                './build/modules/@('+deps.join('|')+')/*.css',
                './build/modules/@('+deps.join('|')+')/**/*.css',
                './build/modules/@('+deps.join('|')+')/module.js',              // first all the module definitions
                './build/modules/@('+deps.join('|')+')/**/!(module).js'         // then all the module js files
            ];


            var meta = JSON.parse(fs.readFileSync('src/meta.json', 'utf8'));
            var vendor = _.where(meta.apps, { module : app.module})[0].vendor;


            var mapVendorPath = function(obj) {
                return _.map(obj, function(path){
                    return './build/vendor/' + path;
                });
            };
            vendor.head.dev = mapVendorPath(vendor.head.dev);
            vendor.head.prod = mapVendorPath(vendor.head.prod);
            vendor.body.dev = mapVendorPath(vendor.body.dev);
            vendor.body.prod = mapVendorPath(vendor.body.prod);



            var otherMains = _.without(_.pluck(meta.apps, 'module'), app.module);
            otherMains = _.intersection(otherMains, deps);
            _.forEach(otherMains, function(otherMain){
                var otherVendor =  _.where(meta.apps, { module : otherMain})[0].vendor;
                vendor.head.dev = _.uniq(vendor.head.dev.concat(otherVendor.head.dev));
                vendor.head.prod = _.uniq(vendor.head.prod.concat(otherVendor.head.prod));
                vendor.body.dev = _.uniq(vendor.body.dev.concat(otherVendor.body.dev));
                vendor.body.prod = _.uniq(vendor.body.prod.concat(otherVendor.body.prod));
            });


            return gulp.src('src/index.html')
                .pipe(rename(app.index))
                .pipe(replace('##APP_MAIN_MODULE##', app.module))
                .pipe(injectIntoIndex(src, '<!-- inject:{{ext}} -->', app.index))
                .pipe(injectIntoIndex(vendor.head.dev, '<!-- vendor:head:{{ext}} -->', app.index))
                .pipe(injectIntoIndex(vendor.body.dev, '<!-- vendor:body:{{ext}} -->', app.index))

                .pipe(gulp.dest('build'));
        };


        return forEachApp(process);
    },

    indexProd : function(){

        var process = function(app) {

            var src = [
                './build/css/' + app.module + '.min.css',
                './build/js/' + app.module + '.min.js'
            ];

            var deps = getModuleDependencies(app.module);

            var meta = JSON.parse(fs.readFileSync('src/meta.json', 'utf8'));
            var vendor = _.where(meta.apps, { module : app.module})[0].vendor;

            var otherMains = _.without(_.pluck(meta.apps, 'module'), app.module);
            otherMains = _.intersection(otherMains, deps);
            _.forEach(otherMains, function(otherMain){
                var otherVendor =  _.where(meta.apps, { module : otherMain})[0].vendor;
                vendor.head.dev = _.uniq(vendor.head.dev.concat(otherVendor.head.dev));
                vendor.head.prod = _.uniq(vendor.head.prod.concat(otherVendor.head.prod));
                vendor.body.dev = _.uniq(vendor.body.dev.concat(otherVendor.body.dev));
                vendor.body.prod = _.uniq(vendor.body.prod.concat(otherVendor.body.prod));
            });

            var mapVendorPath = function(obj) {
                return _.map(obj, function(path){
                    return './build/vendor/' + path;
                });
            };
            vendor.head.dev = mapVendorPath(vendor.head.dev);
            vendor.head.prod = mapVendorPath(vendor.head.prod);
            vendor.body.dev = mapVendorPath(vendor.body.dev);
            vendor.body.prod = mapVendorPath(vendor.body.prod);

            var str = fs.readFileSync('./busters.json', "utf8");
            var hashes = JSON.parse(str);

            return gulp.src('src/index.html')
                .pipe(rename(app.index))
                .pipe(replace('##APP_MAIN_MODULE##', app.module))
                .pipe(injectIntoIndex(src, '<!-- inject:{{ext}} -->', app.index, hashes))
                .pipe(injectIntoIndex(vendor.head.dev, '<!-- vendor:head:{{ext}} -->', app.index, hashes))
                .pipe(injectIntoIndex(vendor.body.dev, '<!-- vendor:body:{{ext}} -->', app.index, hashes))
                .pipe(minifyHtml(minifyHtmlOptions))
                .pipe(gulp.dest('build'));
        };

        return forEachApp(process);
    },

    karma : function () {


        var process = function (app) {

            if (app.module === 'Test' )
                return;

            var isProdBuild = fs.existsSync('./build/js/' + app.module + '.min.js' );


            var meta = JSON.parse(fs.readFileSync('./src/meta.json','utf-8'));
            var vendor = _.where(meta.apps, { module : app.module})[0].vendor;

            var vendorFiles = isProdBuild ? vendor.head.prod.concat(vendor.body.prod) : vendor.head.dev.concat(vendor.body.dev);

            // keep only .js files
            vendorFiles = _.filter(vendorFiles, function(file){
                return file.match(/\.js$/);
            });

            // add directory
            vendorFiles = _.map(vendorFiles, function(file){
                return 'build/vendor/' + file;
            });

            vendorFiles.push('src/vendor/angular-mocks/angular-mocks.js');


            var testFiles = vendorFiles;

            testFiles.push('src/modules/_mock/!(*.test).js');

            if (isProdBuild)
                testFiles.push('./build/js/' + app.module + '.min.js');

            var deps = getModuleDependencies(app.module);
            _.forEach(deps, function(dep) {
                if (!isProdBuild) {
                    testFiles.push('build/modules/' + dep + '/*.js');
                    testFiles.push('build/modules/' + dep + '/**/*.js');
                }
                testFiles.push('src/modules/'+dep+'/**/MOCK.test.js');
                testFiles.push('src/modules/'+dep+'/**/*.test.js');
            });


            // Be sure to return the stream
            return gulp.src(testFiles, {read:false})
                .pipe(karma({
                    configFile: 'karma/' + app.module + '.conf.js',
                    action: 'run'
                }))
                .on('error', function(err) {
                    // Make sure failed tests cause gulp to exit non-zero
                    throw err;
                });

        };

        forEachAppNoStream(process);

    }
};


//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//
//                                         BUILD TASKS
//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//

gulp.task('clean', ['jshint'], task.clean);
gulp.task('vendor', ['clean'], task.vendor);
gulp.task('assets', ['clean'], task.assets);
gulp.task('less', ['clean'], task.less);
gulp.task('js', ['clean'], task.js);
gulp.task('template-list', ['js'], task.templateList);
gulp.task('templates', ['clean'], task.templates);
gulp.task('index', ['vendor', 'assets', 'less', 'templates', 'meta', 'template-list', 'js'], task.index);

gulp.task('meta', ['js'], task.meta);
gulp.task('meta-align', ['js'], task.metaAlign);

gulp.task('build', ['clean', 'index', 'vendor', 'less', 'templates', 'template-list', 'js']);
gulp.task('dev', ['build', 'meta-align', 'ngdoc'], task.karma);


// PROD specific

gulp.task('html2js-prod', ['build'], task.html2jsProd);
gulp.task('js-prod', ['html2js-prod', 'build'], task.jsProd);
gulp.task('css-prod', ['build'], task.cssProd);
gulp.task('index-prod', ['js-prod', 'css-prod', 'build'], task.indexProd);
gulp.task('prod', ['js-prod', 'css-prod', 'index-prod', 'build', 'meta-align', 'ngdoc'], function(version){

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

    task.karma();

    return merge (curStream, srcStream);
});




//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//
//                                     TEST / REPORTS TASKS
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
//                                     WATCH TASKS
//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//

// works in dev mode
gulp.task('watch', ['build'], function(){


    watch('src/**/*.less', function(){
        try {
            //    task.cleanLess();
            task.less()
                .on('end', task.index);
        } catch (e) {
            console.log(e);
        }
    });


    watch('src/modules/**/*.js', function(){
        try {
            // task.cleanJs();
            task.js()
                //    .on('end', task.templateList)
                .on('end', task.index);
        } catch (e) {
            console.log(e);
        }
    });


    watch('src/modules/**/*.html', function(){
        try {
            //   task.cleanTemplates();
            task.templates()
                .on('end', task.templateList)
                .on('end', task.index);
        } catch (e) {
            console.log(e);
        }
    });


    watch('src/assets/**/*', function(){
        try {
            //    task.cleanAssets();
            task.assets();
        } catch (e) {
            console.log(e);
        }
    });

});




