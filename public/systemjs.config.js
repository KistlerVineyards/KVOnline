(function (global) {
  System.config({
    paths: {
      // paths serve as alias
      'npm:': 'node_modules/'
    },
    // map tells the System loader where to look for things
    map: {
      // our app is within the app folder
      app: 'app',
      // angular bundles
      '@angular/core': 'npm:@angular/core/bundles/core.umd.min.js',
      '@angular/common': 'npm:@angular/common/bundles/common.umd.min.js',
      '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.min.js',
      '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.min.js',
      '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.min.js',
      '@angular/http': 'npm:@angular/http/bundles/http.umd.min.js',
      '@angular/router': 'npm:@angular/router/bundles/router.umd.min.js',
      '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.min.js'
      // other libraries
      , 'rxjs': 'npm:rxjs'
      , 'angular-in-memory-web-api': 'npm:angular-in-memory-web-api'
      , 'ng2-modal': 'node_modules/ng2-modal'  
      , "ng2-bootstrap": "npm:ng2-bootstrap"
      , 'moment': 'npm:moment'
      , 'primeng': 'npm:primeng'
      , '@ng-idle/core': 'npm:@ng-idle/core/bundles/core.umd.min.js'
    },
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
      app: {
        main: './main.js',
        defaultExtension: 'js'
      }
      , rxjs: {
        defaultExtension: 'js'
      }
      , 'angular-in-memory-web-api': {
        main: './index.js',
        defaultExtension: 'js'
      }
      , 'ng2-modal': { "main": "index.js", "defaultExtension": "js" }
      , 'moment': { main: 'moment.js', defaultExtension: 'js' }
      , primeng: {
        defaultExtension: 'js'
      }
      , 'ng2-bootstrap': {
        defaultExtension: 'js'
      }
    }
  });
})(this);