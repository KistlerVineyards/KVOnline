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
var app_service_1 = require("../../services/app.service");
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
                //console.log(d.data.error.status);
                _this.appService.showAlert(_this.alert, true, 'emailNotFound');
            }
            else {
                console.log('Success');
                _this.router.navigate(['/login']);
            }
        });
    }
    ;
    ForgotPassword.prototype.ngOnInit = function () {
        this.forgotForm = this.fb.group({
            codeOrMail: ['', forms_1.Validators.required]
        });
    };
    ;
    ForgotPassword.prototype.sendMail = function (codeOrMail) {
        this.alert = {};
        var base64Encoded = this.appService.encodeBase64(codeOrMail);
        this.appService.httpPost('post:forgot:password', { auth: base64Encoded });
    };
    ;
    ForgotPassword.prototype.cancel = function () {
        this.router.navigate(['/login']);
    };
    ;
    ForgotPassword.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    return ForgotPassword;
}());
ForgotPassword = __decorate([
    core_1.Component({
        templateUrl: 'app/components/forgotPassword/forgotPassword.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService, router_1.Router, forms_1.FormBuilder])
], ForgotPassword);
exports.ForgotPassword = ForgotPassword;
//# sourceMappingURL=forgotPassword.component.js.map