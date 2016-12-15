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
var customValidators_1 = require('../../services/customValidators');
var app_service_1 = require('../../services/app.service');
var md5_1 = require('../../vendor/md5');
var CreateAccount = (function () {
    function CreateAccount(appService, router, fb) {
        var _this = this;
        this.appService = appService;
        this.router = router;
        this.fb = fb;
        this.createAccountForm = fb.group({
            email: ['', [forms_1.Validators.required, customValidators_1.CustomValidators.emailValidator]],
            password: ['', forms_1.Validators.required],
            confirmPassword: ['', forms_1.Validators.required]
        });
        this.subscription = appService.filterOn('post:create:account')
            .subscribe(function (d) {
            console.log(d);
            if (d.data.error) {
                console.log(d.data.error.status);
                appService.resetCredential();
            }
            else {
                _this.router.navigate(['/login']);
            }
        });
    }
    ;
    CreateAccount.prototype.createAccount = function () {
        var pwd = this.createAccountForm.controls["password"].value;
        var confirmPwd = this.createAccountForm.controls["confirmPassword"].value;
        if (pwd === confirmPwd) {
            var data = {
                email: this.createAccountForm.controls["email"].value,
                hash: md5_1.md5(pwd)
            };
            this.appService.httpPost('post:create:account', data);
        }
    };
    ;
    CreateAccount.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    ;
    CreateAccount = __decorate([
        core_1.Component({
            templateUrl: 'app/components/createAccount/createAccount.component.html'
        }), 
        __metadata('design:paramtypes', [app_service_1.AppService, router_1.Router, forms_1.FormBuilder])
    ], CreateAccount);
    return CreateAccount;
}());
exports.CreateAccount = CreateAccount;
//# sourceMappingURL=createAccount.component.js.map