"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var app_service_1 = require("../services/app.service");
var config_1 = require("../config");
var core_2 = require("@ng-idle/core");
var AppComponent = (function () {
    //needHelpDisplay:boolean=false;
    function AppComponent(appService, router, idle) {
        var _this = this;
        this.appService = appService;
        this.router = router;
        this.idle = idle;
        this.home = '#';
        this.kistler = '#';
        this.viewBox = config_1.viewBoxConfig['/login'];
        this.showMenu = false;
        this.myAccountshowMenu = false;
        this.currentEmail = "";
        this.needHelpText = "";
        this.logout = function () {
            _this.appService.resetCredential();
            _this.appService.clearSettings();
            if (_this.idle.isIdling() || _this.idle.isRunning()) {
                _this.idle.stop();
            }
        };
        this.setInactivityTimeout = function () {
            var secs;
            var credential = _this.appService.getCredential();
            // if (!credential) {
            //   return;
            // }
            //set current user to be displayed to nav bar
            _this.currentEmail = credential.user.email;
            secs = credential.inactivityTimeoutSecs || 300;
            if (_this.idle.isIdling() || _this.idle.isRunning()) {
                _this.idle.stop();
            }
            // sets an idle timeout of 15 seconds, for testing purposes.
            _this.idle.setIdle(Number(secs));
            // sets a timeout period of 15 seconds. after 30 seconds of inactivity, the user will be considered timed out.
            _this.idle.setTimeout(Number(secs));
            // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
            _this.idle.setInterrupts(core_2.DEFAULT_INTERRUPTSOURCES);
            // this.idle.onIdleEnd.subscribe(() => { 
            //   // this.idleState = 'No longer idle.' ;
            //   console.log('Idle end');
            // });
            _this.idle.onTimeout.take(1).subscribe(function () {
                // this.idleState = 'Timed out!';
                // this.timedOut = true;
                console.log('time out');
                _this.logout();
                _this.router.navigate(['/login']);
            });
            // this.idle.onIdleStart.subscribe(() => { 
            //   // this.idleState = 'You\'ve gone idle!' ;
            //   console.log('idle start');
            // });
            // this.idle.onTimeoutWarning.subscribe((countdown) => { 
            //   // this.idleState = 'You will time out in ' + countdown + ' seconds!' ;
            // });
            _this.idle.watch();
        };
        this.initMenu(window.innerWidth);
        this.needHelpSub = appService.behFilterOn('settings:download:success').subscribe(function (d) {
            _this.needHelpText = _this.appService.getSetting('needHelpText');
            //this.needHelpText = this.appService.getNeedHelpText();
            //this.isDataReady = true;
        });
        this.initDataSub = appService.filterOn('get:init:data').subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                //this.home = d.data.host;
                _this.kistler = d.data.kistler;
            }
        });
        router.events.filter(function (e, t) {
            return (e.constructor.name === 'NavigationEnd');
        }).subscribe(function (event) {
            var url = event.urlAfterRedirects.split('?')[0];
            _this.viewBox = config_1.viewBoxConfig[url];
        });
    }
    ;
    AppComponent.prototype.ngOnInit = function () {
        var credential = this.appService.getCredential();
        if (credential) {
            this.appService.loadSettings();
            this.setInactivityTimeout();
        }
        this.appService.httpGet('get:init:data');
        //request / reply mecanism to start inactivity timer at successful login
        this.appService.reply('login:success', this.setInactivityTimeout);
    };
    ;
    AppComponent.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
        this.initDataSub.unsubscribe();
        this.needHelpSub.unsubscribe();
    };
    ;
    AppComponent.prototype.menuToggle = function () {
        this.showMenu = !this.showMenu;
    };
    ;
    AppComponent.prototype.myAccountToggle = function () {
        this.myAccountshowMenu = !this.myAccountshowMenu;
    };
    ;
    AppComponent.prototype.initMenu = function (windowSize) {
        if (windowSize >= 768) {
            this.showMenu = true;
            this.myAccountshowMenu = true;
        }
        else {
            this.showMenu = false;
            this.myAccountshowMenu = false;
        }
    };
    ;
    AppComponent.prototype.onResize = function (event) {
        this.initMenu(event.target.innerWidth);
    };
    ;
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: 'my-app',
        templateUrl: 'app/components/app.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService, router_1.Router, core_2.Idle])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map