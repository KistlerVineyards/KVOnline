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
var CreateAccount = (function () {
    function CreateAccount(appService, router, fb, activatedRoute) {
        var _this = this;
        this.appService = appService;
        this.router = router;
        this.fb = fb;
        this.activatedRoute = activatedRoute;
        this.newUserText = '';
        this.allowCreateNewUser = false;
        this.createAccountForm = fb.group({
            code: [''],
            password: ['', [forms_1.Validators.required, customValidators_1.CustomValidators.pwdComplexityValidator]],
            confirmPassword: ['', [forms_1.Validators.required, customValidators_1.CustomValidators.pwdComplexityValidator]]
        });
        this.subscription = appService.filterOn('post:create:account')
            .subscribe(function (d) {
            console.log(d);
            if (d.data.error) {
                console.log(d.data.error.status);
                appService.resetCredential();
            }
            else {
                // this.alert.show = false;
                _this.appService.setCredential(d.data.user, d.data.token, d.data.inactivityTimeoutSecs);
                //start inactivity timeout using request / reply mecanism
                _this.appService.request('login:success')();
                _this.appService.loadSettings();
                _this.router.navigate(['order']);
            }
        });
        this.newUserSub = appService.filterOn('post:new:user:login')
            .subscribe(function (d) {
            if (d.data.error) {
                _this.router.navigate(['/login']);
            }
            else {
                var res = d.data.result.split('#;');
                var toLogin = void 0, newUserText = void 0;
                if (res.length === 2) {
                    toLogin = res[0];
                    newUserText = res[1];
                }
                if (toLogin === 'login') {
                    _this.router.navigate(['/login']);
                }
                else if (toLogin === 'newUser') {
                    _this.allowCreateNewUser = true;
                    _this.newUserText = newUserText;
                }
                else {
                    _this.router.navigate(['/login']);
                }
            }
        });
    }
    ;
    CreateAccount.prototype.createAccount = function () {
        var pwd = this.createAccountForm.controls["password"].value;
        var confirmPwd = this.createAccountForm.controls["confirmPassword"].value;
        if (pwd === confirmPwd) {
            var code = this.createAccountForm.controls["code"].value;
            var hash = md5_1.md5(pwd);
            var auth = this.appService.encodeBase64(code + ":" + hash);
            this.appService.httpPost('post:create:account', { auth: auth });
        }
    };
    ;
    CreateAccount.prototype.ngOnInit = function () {
        var _this = this;
        this.querySub = this.activatedRoute.queryParams.take(1).subscribe(function (params) {
            _this.code = params['code'];
            _this.offerId = params['offerId'];
            if (_this.code) {
                _this.createAccountForm.controls['code'].setValue(_this.code);
            }
        });
        var auth = this.appService.encodeBase64(this.code + ':' + this.offerId);
        this.appService.httpPost('post:new:user:login', { auth: auth });
    };
    ;
    CreateAccount.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
        this.querySub.unsubscribe();
        this.newUserSub.unsubscribe();
    };
    ;
    return CreateAccount;
}());
CreateAccount = __decorate([
    core_1.Component({
        templateUrl: 'app/components/createAccount/createAccount.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService, router_1.Router, forms_1.FormBuilder, router_1.ActivatedRoute])
], CreateAccount);
exports.CreateAccount = CreateAccount;
//# sourceMappingURL=createAccount.component.js.map