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
      '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
      '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
      '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
      '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
      '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
      '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
      '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
      '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js'
      // other libraries
      , 'rxjs': 'npm:rxjs'
      , 'angular-in-memory-web-api': 'npm:angular-in-memory-web-api'
      , 'ng2-modal': 'node_modules/ng2-modal'
      , "ng2-bootstrap": "npm:ng2-bootstrap/bundles/ng2-bootstrap.umd.js"
      , 'moment': 'npm:moment'
      // , 'mydatepicker': 'npm:mydatepicker'
      , 'primeng': 'npm:primeng'
      //, 'ng2-bootstrap/ng2-bootstrap': 'npm:ng2-bootstrap/bundles/ng2-bootstrap.umd.js'
      // , 'jquery': 'npm:jquery/dist/jquery.min.js'
      // , 'bootstrap':'npm:bootstrap/dist/js/bootstrap.min.js'
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
      // , mydatepicker: {
      //   defaultExtension: 'js'
      // }
      , primeng: {
        defaultExtension: 'js'
      }
      // , 'ng2-bootstrap/ng2-bootstrap': {
      //   defaultExtension: 'js'
      // }
    }
  });
})(this);