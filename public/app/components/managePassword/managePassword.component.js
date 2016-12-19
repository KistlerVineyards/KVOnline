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
var forms_1 = require("@angular/forms");
var customValidators_1 = require("../../services/customValidators");
var app_service_1 = require("../../services/app.service");
var md5_1 = require("../../vendor/md5");
var ForgotPassword = (function () {
    function ForgotPassword(appService, router, fb) {
        var _this = this;
        this.appService = appService;
        this.router = router;
        this.fb = fb;
        this.alert = {};
        this.subscription = appService.filterOn('post:forgot:password')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error.status);
                _this.appService.showAlert(_this.alert, true, 'emailNotFound');
            }
            else {
                console.log('Success');
                //this.appService.showAlert(this.alert, true, 'emailFound');
                _this.router.navigate(['/login']);
            }
        });
    }
    ;
    ForgotPassword.prototype.ngOnInit = function () {
        this.forgotForm = this.fb.group({
            email: ['', [forms_1.Validators.required, customValidators_1.CustomValidators.emailValidator]]
        });
    };
    ForgotPassword.prototype.sendMail = function (email) {
        this.alert = {};
        var base64Encoded = this.appService.encodeBase64(email);
        this.appService.httpPost('post:forgot:password', { auth: base64Encoded });
    };
    ForgotPassword.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    return ForgotPassword;
}());
ForgotPassword = __decorate([
    core_1.Component({
        templateUrl: 'app/components/managePassword/forgotPassword.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService, router_1.Router, forms_1.FormBuilder])
], ForgotPassword);
exports.ForgotPassword = ForgotPassword;
//send password component
var SendPassword = (function () {
    function SendPassword(appService, router) {
        var _this = this;
        this.appService = appService;
        this.router = router;
        this.subscription = appService.filterOn('post:send:password')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error.status);
            }
            else {
                console.log('Success');
                _this.router.navigate(['/login']);
            }
        });
    }
    ;
    SendPassword.prototype.sendPassword = function () {
        var code = window.location.search.split('=')[1];
        console.log(code);
        this.appService.httpPost('post:send:password', { auth: code });
    };
    SendPassword.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    return SendPassword;
}());
SendPassword = __decorate([
    core_1.Component({
        template: "\n  <button (click)=\"sendPassword()\">Send Password</button>\n  "
    }),
    __metadata("design:paramtypes", [app_service_1.AppService, router_1.Router])
], SendPassword);
exports.SendPassword = SendPassword;
//change password component
var ChangePassword = (function () {
    function ChangePassword(appService, router, fb) {
        var _this = this;
        this.appService = appService;
        this.router = router;
        this.fb = fb;
        this.alert = {};
        this.subscription = appService.filterOn('post:change:password')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error.status);
                //this.alert.show=true;
                _this.appService.showAlert(_this.alert, true, 'changePasswordFailed');
            }
            else {
                _this.appService.resetCredential();
                _this.appService.showAlert(_this.alert, true, '', 'success');
            }
        });
    }
    ;
    ChangePassword.prototype.ngOnInit = function () {
        this.changePwdForm = this.fb.group({
            oldPassword: ['', forms_1.Validators.required],
            newPassword1: ['', forms_1.Validators.required],
            newPassword2: ['', forms_1.Validators.required
            ]
        }, { validator: this.checkFormGroup });
    };
    ;
    // testAsync(control) {
    //   let pr = new Promise((resolve, reject) => {
    //     this.appService.filterOn('get:default:credit:card').subscribe(d => {
    //       if (d.data.error) {
    //         console.log('Error in default credit card');
    //       } else {
    //         resolve({ testError: true });
    //       }
    //     });
    //     this.appService.httpGet('get:default:credit:card');
    //   });
    //   return (pr);
    // }
    ChangePassword.prototype.checkFormGroup = function (group) {
        var ret = null;
        if (group.dirty) {
            if (group.value.oldPassword == group.value.newPassword1) {
                ret = { 'oldAndNewPasswordsSame': true };
            }
            else if (group.value.newPassword1 != group.value.newPassword2) {
                ret = { 'confirmPasswordMismatch': true };
            }
        }
        return (ret);
    };
    ;
    ChangePassword.prototype.changePassword = function (oldPwd, newPwd1, newPwd2) {
        var credential = this.appService.getCredential();
        if (credential) {
            var email = credential.email;
            if (email) {
                if (newPwd1 === newPwd2) {
                    var base64Encoded = this.appService.encodeBase64(email + ':' + md5_1.md5(oldPwd) + ':' + md5_1.md5(newPwd1));
                    console.log(base64Encoded);
                    this.appService.httpPost('post:change:password', { auth: base64Encoded, token: credential.token });
                }
            }
            else {
                this.router.navigate(['/login']);
            }
        }
    };
    ChangePassword.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    return ChangePassword;
}());
ChangePassword = __decorate([
    core_1.Component({
        templateUrl: 'app/components/managePassword/changePassword.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService, router_1.Router, forms_1.FormBuilder])
], ChangePassword);
exports.ChangePassword = ChangePassword;
//# sourceMappingURL=managePassword.component.js.map