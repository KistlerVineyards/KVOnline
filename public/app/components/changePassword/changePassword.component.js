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
var ChangePassword = (function () {
    function ChangePassword(appService, router, fb) {
        var _this = this;
        this.appService = appService;
        this.router = router;
        this.fb = fb;
        this.alert = {};
        this.messages = [];
        this.subscription = appService.filterOn('post:change:password')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error.status);
                _this.appService.showAlert(_this.alert, true, 'changePasswordFailed');
            }
            else {
                _this.appService.resetCredential();
                _this.appService.showAlert(_this.alert, false);
                _this.messages = [];
                _this.messages.push({
                    severity: 'success',
                    summary: 'Saved',
                    detail: 'Data saved successfully'
                });
                _this.router.navigate(['/login']);
            }
        });
    }
    ;
    ChangePassword.prototype.ngOnInit = function () {
        this.changePwdForm = this.fb.group({
            oldPassword: ['', forms_1.Validators.required],
            newPassword1: ['', [forms_1.Validators.required, customValidators_1.CustomValidators.pwdComplexityValidator]],
            newPassword2: ['', [forms_1.Validators.required, customValidators_1.CustomValidators.pwdComplexityValidator]]
        }, { validator: this.checkFormGroup });
    };
    ;
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
            var email = credential.user.email;
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
        templateUrl: 'app/components/changePassword/changePassword.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService, router_1.Router, forms_1.FormBuilder])
], ChangePassword);
exports.ChangePassword = ChangePassword;
//# sourceMappingURL=changePassword.component.js.map