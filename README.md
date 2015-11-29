#tic-tac-toe
## a demo tic-tac-toe Angular application

### Prerequisites

Git: [http://git-scm.com/](http://git-scm.com/).

NodeJS: [http://nodejs.org/](http://nodejs.org/).


### Install Dependencies

Run

```
npm install
```

to install node and bower components at once

### Build the Application
The application can be built in development and production mode (with optimizations as minification,
cache busting, etc.).

```
npm run dev
npm run prod
```

### Reports

- **Coverage report:** [http://localhost:3000/report/coverage](http://localhost:3000/report/coverage), generated every time Karma runs the unit tests (```gulp karma```, also launched on build)
- **Complexity report:** [http://localhost:3000/report/complexity](http://localhost:3000/report/complexity) generated by plato (```gulp plato```, also launched on build)
- **ngDocs documentation:** [http://localhost:3000/docs](http://localhost:3000/docs) generated by ngdocs (```gulp ngdoc```, also launched on build)


### Run the Application

There is a simple development web server.  The simplest way to start
this server is:

```
npm start
```

And browse to the app at [http://localhost:3000](http://localhost:3000).



## Directory Layout

```
src/                  --> all of the source files for the application
  vendor/                 --> bower third-party packages
    ...
  assets/                 --> assets folder for images, fonts etc.
    ...
  modules/                --> folder containing all Angular modules
  
    <module name>/       --> module folder
    
      module.js    		  --> the module declaration file, contains just the module dependency statement
      
      config/            --> optional folders containing the code, separated by type
      constants/
      controllers/
      directives/
      services/
      templates/
      
          
  index.html              --> main index file (the main html template file of the app)
  _templ.js               --> template file for the template constant-map
  meta.json               --> contains development metadata (info on version, environment, apps etc.)
  
karma/
  <main module name>.conf.js             --> config file for running unit tests with Karma

gulpfile.js               --> Gulp tasks definition


build/                    --> the compiled application files
```



### Running Unit Tests

To run the unit tests, run:

```bash
gulp karma
```

or, if you don't have Gulp installed globally:

```bash
npm run test
```

This script will start the Karma test runner to execute the unit tests.

A coverage html report will be generated, it will be available at ```http://localhost:3000/report/coverage```.
