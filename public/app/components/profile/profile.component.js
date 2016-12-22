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
var forms_1 = require("@angular/forms");
var customValidators_1 = require("../../services/customValidators");
var app_service_1 = require("../../services/app.service");
var util_1 = require("../../services/util");
var Profile = (function () {
    function Profile(appService, fb) {
        var _this = this;
        this.appService = appService;
        this.fb = fb;
        this.alert = {};
        this.profile = {};
        this.selectedCountryName = 'United States';
        this.messages = [];
        this.isDataReady = false;
        this.user = {};
        this.user = appService.getCredential().user;
        this.initProfileForm();
        this.dataReadySubs = appService.behFilterOn('masters:download:success').subscribe(function (d) {
            _this.countries = _this.appService.getCountries();
            _this.isDataReady = true;
        });
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
                _this.initProfileForm();
            }
        });
        this.smartyStreetSubscription = appService.filterOn('get:smartyStreet')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                var data = d.data;
                if (d.data.length > 0) {
                    data = d.data[0].components;
                    var street = (data.street_predirection || '').concat(' ', data.primary_number, ' ', data.street_name, ' ', data.street_suffix, ' ', data.street_postdirection);
                    console.log({
                        street: street.trim(),
                        city: data.city_name,
                        state: data.state_abbreviation,
                        zipcode: data.zipcode
                    });
                }
                else {
                    console.log('Invalid Address');
                }
            }
        });
        this.saveProfileSubscription = appService.filterOn('post:save:profile')
            .subscribe(function (d) {
            if (d.data.error) {
                _this.appService.showAlert(_this.alert, true, 'dataNotSaved');
            }
            else {
                //this.appService.showAlert(this.alert, true, 'dataSaved', 'success');
                _this.messages = [];
                _this.messages.push({
                    severity: 'success',
                    summary: 'Saved',
                    detail: 'Data saved successfully'
                });
                _this.appService.httpGet('get:user:profile');
            }
        });
    }
    ;
    Profile.prototype.ngOnInit = function () {
        this.appService.httpGet('get:user:profile');
    };
    ;
    Profile.prototype.onDateChanged = function (event) {
    };
    ;
    Profile.prototype.initProfileForm = function () {
        var mDate = util_1.Util.convertToUSDate(this.profile.birthDay);
        this.profileForm = this.fb.group({
            id: [this.profile.id],
            firstName: [this.profile.firstName, forms_1.Validators.required],
            phone: [this.profile.phone, [forms_1.Validators.required, customValidators_1.CustomValidators.phoneValidator]],
            birthDay: [mDate, forms_1.Validators.required],
            mailingAddress1: [this.profile.mailingAddress1, forms_1.Validators.required],
            mailingAddress2: [this.profile.mailingAddress2],
            mailingCity: [this.profile.mailingCity, forms_1.Validators.required],
            mailingState: [this.profile.mailingState, forms_1.Validators.required],
            mailingZip: [this.profile.mailingZip, forms_1.Validators.required],
            mailingCountry: [this.profile.mailingCountry, forms_1.Validators.required]
        });
    };
    ;
    Profile.prototype.getUpdatedProfile = function () {
        var mDate = util_1.Util.getISODate(this.profileForm.controls['birthDay'].value);
        var pr = {};
        pr.id = this.profile.id;
        pr.firstName = this.profileForm.controls['firstName'].value;
        //pr.lastName = this.profileForm.controls['lastName'].value;
        pr.phone = this.profileForm.controls['phone'].value;
        pr.birthDay = mDate;
        pr.mailingAddress1 = this.profileForm.controls['mailingAddress1'].value;
        pr.mailingAddress2 = this.profileForm.controls['mailingAddress2'].value;
        pr.mailingAddress2 = pr.mailingAddress2 ? pr.mailingAddress2 : '';
        pr.mailingCity = this.profileForm.controls['mailingCity'].value;
        pr.mailingState = this.profileForm.controls['mailingState'].value;
        pr.mailingZip = this.profileForm.controls['mailingZip'].value;
        pr.mailingCountry = this.profileForm.controls['mailingCountry'].value; // this.profileForm.controls['mailingCountry'].value;
        pr.mailingCountryisoCode = this.countries.filter(function (d) { return d.countryName == pr.mailingCountry; })[0].isoCode;
        return (pr);
    };
    ;
    Profile.prototype.submit = function () {
        // this.profile.birthDay = Util.convertToISODate(this.profileForm.controls['birthDay'].value);
        if (this.profileForm.dirty && this.profileForm.valid) {
            this.appService.httpPost('post:save:profile', { profile: this.getUpdatedProfile() });
        }
    };
    Profile.prototype.ngOnDestroy = function () {
        this.getProfileSubscription.unsubscribe();
        this.saveProfileSubscription.unsubscribe();
        this.smartyStreetSubscription.unsubscribe();
        this.dataReadySubs.unsubscribe();
    };
    ;
    return Profile;
}());
Profile = __decorate([
    core_1.Component({
        templateUrl: 'app/components/profile/profile.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService, forms_1.FormBuilder])
], Profile);
exports.Profile = Profile;
//# sourceMappingURL=profile.component.js.map