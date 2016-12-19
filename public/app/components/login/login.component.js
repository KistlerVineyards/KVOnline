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
/*
This software developed by Sushant Agrawal, India, 92/2A Bidhan Nagar Road, Kol 700067, email: capitalch@gmail.com, sagarwal@netwoven.com
*/
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
require("rxjs/add/operator/take");
var forms_1 = require("@angular/forms");
var app_service_1 = require("../../services/app.service");
var md5_1 = require("../../vendor/md5");
var Login = (function () {
    function Login(appService, router, fb, activatedRoute) {
        var _this = this;
        this.appService = appService;
        this.router = router;
        this.fb = fb;
        this.activatedRoute = activatedRoute;
        this.alert = {
            show: false,
            type: 'danger',
            message: this.appService.getValidationErrorMessage('loginFailed')
        };
        this.loginForm = fb.group({
            email: ['', [forms_1.Validators.required]],
            password: ['', forms_1.Validators.required]
        });
        this.subscription = appService.filterOn('post:authenticate')
            .subscribe(function (d) {
            console.log(d);
            if (d.data.error) {
                console.log(d.data.error.status);
                appService.resetCredential();
                _this.alert.show = true;
            }
            else {
                //console.log('token:' + d.data.token);
                _this.alert.show = false;
                // appService.setCredential(this.loginForm.controls["email"].value, d.data.token);
                appService.setCredential(d.data.user, d.data.token, d.data.inactivityTimeoutSecs);
                //start inactivity timeout using request / reply mecanism
                appService.request('login:success')();
                router.navigate(['order']);
            }
        });
    }
    ;
    Login.prototype.authenticate = function (pwd) {
        if (this.loginForm.valid) {
            var base64Encoded = this.appService.encodeBase64(this.loginForm.controls["email"].value + ':' + md5_1.md5(pwd));
            console.log('md5:' + md5_1.md5(pwd));
            console.log(base64Encoded);
            this.appService.httpPost('post:authenticate', { auth: base64Encoded });
        }
        else {
            this.alert.show = true;
        }
    };
    ;
    Login.prototype.ngOnInit = function () {
        var _this = this;
        this.activatedRoute.queryParams.take(1).subscribe(function (params) {
            var email = params['email'];
            if (email) {
                _this.loginForm.controls["email"].setValue(email);
            }
        });
        this.loginFormChangesSubscription = this.loginForm.valueChanges.take(1).subscribe(function (x) {
            _this.alert.show = false;
        });
    };
    Login.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
        //this.loginFormChangesSubscription.unsubscribe();
    };
    return Login;
}());
Login = __decorate([
    core_1.Component({
        templateUrl: 'app/components/login/login.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService, router_1.Router, forms_1.FormBuilder, router_1.ActivatedRoute])
], Login);
exports.Login = Login;
//# sourceMappingURL=login.component.js.map