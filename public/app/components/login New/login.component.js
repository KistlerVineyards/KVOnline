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
var core_1 = require('@angular/core');
var router_1 = require('@angular/router');
var forms_1 = require('@angular/forms');
//import { AlertModule } from 'ng2-bootstrap';
var app_service_1 = require('../../services/app.service');
var customValidators_1 = require('../../services/customValidators');
var md5_1 = require('../../vendor/md5');
var Login = (function () {
    function Login(appService, router, fb) {
        var _this = this;
        this.appService = appService;
        this.router = router;
        // alert: any = {
        //   show: false,
        //   type: 'danger',
        //   message: this.appService.getValidationErrorMessage('loginFailed')
        // }
        this.isFailed = false;
        this.loginForm = fb.group({
            email: ['', [forms_1.Validators.required, customValidators_1.CustomValidators.emailValidator]],
            password: ['', forms_1.Validators.required]
        });
        this.subscription = appService.filterOn('post:authenticate')
            .subscribe(function (d) {
            console.log(d);
            if (d.data.error) {
                console.log(d.data.error.status);
                //this.alert.show = true;
                appService.resetCredential();
            }
            else {
                console.log('token:' + d.data.token);
                //this.alert.show = false;
                _this.router.navigate(['order']);
            }
        });
    }
    ;
    Login.prototype.authenticate = function (pwd) {
        var base64Encoded = this.appService.encodeBase64(this.loginForm.controls["email"].value + ':' + md5_1.md5(pwd));
        console.log('md5:' + md5_1.md5(pwd));
        this.appService.httpPost('post:authenticate', { auth: base64Encoded });
    };
    ;
    Login.prototype.logout = function () {
        this.appService.resetCredential();
        this.router.navigate(['/login']);
    };
    ;
    Login.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    ;
    Login = __decorate([
        core_1.Component({
            templateUrl: 'app/components/login/login.component.html',
            styles: ["\n        .ng-valid {\n          border: 1px solid #42A948;\n        }\n        .ng-invalid {\n            border: 1px solid #a94442;\n        }\n    "]
        }), 
        __metadata('design:paramtypes', [app_service_1.AppService, router_1.Router, forms_1.FormBuilder])
    ], Login);
    return Login;
}());
exports.Login = Login;
//# sourceMappingURL=login.component.js.map