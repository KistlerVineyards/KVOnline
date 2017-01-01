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
var CreatePassword = (function () {
    function CreatePassword(appService, router, fb) {
        var _this = this;
        this.appService = appService;
        this.router = router;
        this.fb = fb;
        this.alert = {};
        this.createPasswordSubs = appService.filterOn('post:create:password')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error.status);
                _this.appService.showAlert(_this.alert, true, 'createPasswordFailed');
            }
            else {
                _this.appService.resetCredential();
                _this.appService.showAlert(_this.alert, false);
                _this.router.navigate(['/login']);
            }
        });
    }
    ;
    CreatePassword.prototype.checkFormGroup = function (group) {
        var ret = null;
        if (group.dirty) {
            if (group.value.newPassword1 != group.value.newPassword2) {
                ret = { 'confirmPasswordMismatch': true };
            }
        }
        return (ret);
    };
    ;
    CreatePassword.prototype.ngOnInit = function () {
        this.createPwdForm = this.fb.group({
            newPassword1: ['', forms_1.Validators.required],
            newPassword2: ['', [forms_1.Validators.required, customValidators_1.CustomValidators.pwdComplexityValidator]]
        }, { validator: this.checkFormGroup });
    };
    ;
    CreatePassword.prototype.createPassword = function (newPwd1, newPwd2) {
        if (newPwd1 === newPwd2) {
            var code = window.location.search.split('=')[1];
            var base64Encoded = this.appService.encodeBase64(md5_1.md5(newPwd1));
            // console.log(base64Encoded);
            this.appService.httpPost('post:create:password', { auth: code, encodedHash: base64Encoded });
        }
        else {
            this.appService.showAlert(this.alert, true, 'confirmPasswordMismatch', 'danger');
        }
    };
    CreatePassword.prototype.ngOnDestroy = function () {
        this.createPasswordSubs.unsubscribe();
    };
    return CreatePassword;
}());
CreatePassword = __decorate([
    core_1.Component({
        templateUrl: 'app/components/managePassword/createPassword.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService, router_1.Router, forms_1.FormBuilder])
], CreatePassword);
exports.CreatePassword = CreatePassword;
//# sourceMappingURL=createPassword.component.js.map