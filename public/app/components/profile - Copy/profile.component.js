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
var app_service_1 = require("../../services/app.service");
var Profile = (function () {
    function Profile(appService) {
        var _this = this;
        this.appService = appService;
        this.profile = {};
        this.getProfileSubscription = appService.filterOn('get:user:profile')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                var profileArray = JSON.parse(d.data).Table;
                if (profileArray.length > 0) {
                    _this.profile = profileArray[0];
                }
            }
        }, function (err) {
            console.log(err);
        });
        this.saveProfileSubscription = appService.filterOn('post:save:profile')
            .subscribe(function (d) {
            console.log(d);
        });
    }
    ;
    Profile.prototype.ngOnInit = function () {
        var token = this.appService.getToken();
        this.appService.httpGet('get:user:profile', { token: token });
    };
    ;
    Profile.prototype.submit = function () {
        var token = this.appService.getToken();
        this.appService.httpPost('post:save:profile', { token: token, profile: this.profile });
    };
    Profile.prototype.ngOnDestroy = function () {
        this.getProfileSubscription.unsubscribe();
        this.saveProfileSubscription.unsubscribe();
    };
    ;
    return Profile;
}());
Profile = __decorate([
    core_1.Component({
        templateUrl: 'app/components/profile/profile.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService])
], Profile);
exports.Profile = Profile;
//# sourceMappingURL=profile.component.js.map