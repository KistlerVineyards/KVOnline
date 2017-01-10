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
var api_1 = require("primeng/components/common/api");
var Profile = (function () {
    function Profile(appService, fb, confirmationService) {
        var _this = this;
        this.appService = appService;
        this.fb = fb;
        this.confirmationService = confirmationService;
        this.profile = {};
        this.selectedCountryName = 'United States';
        this.alert = {
            show: false,
            type: 'danger',
            message: this.appService.getValidationErrorMessage('invalidAddress')
        };
        this.messages = [];
        this.isDataReady = false;
        this.user = {};
        this.mask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
        this.isVerifying = false;
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
        this.verifyAddressSub = this.appService.filterOn('get:smartyStreet').subscribe(function (d) {
            if (d.data.error) {
                //Authorization of vendor at smartyStreet failed. Maybe purchase of new slot required
                _this.appService.showAlert(_this.alert, true, 'addressValidationUnauthorized');
                _this.isVerifying = false;
            }
            else {
                if (d.data.length == 0) {
                    // Verification failed since there is no return
                    _this.isVerifying = false;
                    _this.invalidAddressConfirmBeforeSave();
                }
                else {
                    //verification succeeded with maybe corrected address as return
                    var data = d.data[0].components;
                    _this.editedAddressConfirmBeforeSave(data);
                }
            }
        });
        this.saveProfileSubscription = appService.filterOn('post:save:profile')
            .subscribe(function (d) {
            if (d.data.error) {
                _this.appService.showAlert(_this.alert, true, 'dataNotSaved');
            }
            else {
                _this.appService.showAlert(_this.alert, false);
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
    Profile.prototype.invalidAddressConfirmBeforeSave = function () {
        var _this = this;
        this.confirmationService.confirm({
            message: this.appService.getMessage('mess:confirm:save:invalid:address'),
            accept: function () {
                _this.submit(false);
            }
        });
    };
    ;
    Profile.prototype.editedAddressConfirmBeforeSave = function (data) {
        var _this = this;
        var street = (data.street_predirection || '').concat(' ', data.primary_number || '', ' ', data.street_name || '', ' ', data.street_suffix || '', ' ', data.street_postdirection || '');
        var addr = street.concat(", ", data.city_name, ", ", data.state_abbreviation, ", ", data.zipcode);
        this.confirmationService.confirm({
            message: this.appService.getMessage('mess:confirm:save:edited:address').concat(addr),
            accept: function () {
                _this.profileForm.controls["mailingAddress1"].setValue(street);
                _this.profileForm.controls["mailingCity"].setValue(data.city_name);
                _this.profileForm.controls["mailingState"].setValue(data.state_abbreviation);
                _this.profileForm.controls["mailingZip"].setValue(data.zipcode);
                _this.appService.showAlert(_this.alert, false);
                _this.submit(true);
            }
        });
    };
    ;
    Profile.prototype.ngOnInit = function () {
        this.appService.httpGet('get:user:profile');
    };
    ;
    Profile.prototype.initProfileForm = function () {
        var mDate = util_1.Util.convertToUSDate(this.profile.birthDay);
        this.profileForm = this.fb.group({
            id: [this.profile.id],
            firstName: [this.profile.firstName, forms_1.Validators.required],
            co: [this.profile.co],
            phone: [this.profile.phone, [forms_1.Validators.required, customValidators_1.CustomValidators.phoneValidator]],
            birthDay: [mDate, forms_1.Validators.required],
            mailingAddress1: [this.profile.mailingAddress1, forms_1.Validators.required],
            mailingAddress2: [this.profile.mailingAddress2],
            mailingCity: [this.profile.mailingCity, forms_1.Validators.required],
            mailingState: [this.profile.mailingState, forms_1.Validators.required],
            mailingZip: [this.profile.mailingZip, forms_1.Validators.required],
            mailingCountry: [this.profile.mailingCountry, forms_1.Validators.required]
        });
        if (!this.profile.mailingCountry) {
            this.profileForm.controls['mailingCountry'].setValue('United States');
        }
        this.profileForm.controls['phone'].markAsDirty();
        this.profileForm.markAsPristine();
    };
    ;
    Profile.prototype.getUpdatedProfile = function () {
        var mDate = util_1.Util.getISODate(this.profileForm.controls['birthDay'].value);
        var pr = {};
        pr.id = this.profile.id;
        pr.firstName = this.profileForm.controls['firstName'].value;
        //pr.lastName = this.profileForm.controls['lastName'].value;
        pr.co = this.profileForm.controls['co'].value;
        pr.co = pr.co ? pr.co : '';
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
    Profile.prototype.verifyOrSubmit = function () {
        this.appService.showAlert(this.alert, false);
        var profile = this.getUpdatedProfile();
        if (profile.mailingCountry == 'United States') {
            this.verify();
        }
        else {
            this.submit();
        }
    };
    ;
    Profile.prototype.verify = function () {
        var usAddress = {
            street: this.profileForm.controls["mailingAddress1"].value,
            street2: this.profileForm.controls["mailingAddress2"].value,
            city: this.profileForm.controls["mailingCity"].value,
            state: this.profileForm.controls["mailingState"].value,
            zipcode: this.profileForm.controls["mailingZip"].value
        };
        this.isVerifying = true;
        this.appService.httpGet('get:smartyStreet', { usAddress: usAddress });
    };
    ;
    Profile.prototype.submit = function (isVerified) {
        var profile = this.getUpdatedProfile();
        profile.isAddressVerified = isVerified || false;
        this.appService.httpPost('post:save:profile', { profile: profile });
    };
    ;
    Profile.prototype.ngOnDestroy = function () {
        this.getProfileSubscription.unsubscribe();
        this.saveProfileSubscription.unsubscribe();
        this.verifyAddressSub.unsubscribe();
        this.dataReadySubs.unsubscribe();
    };
    ;
    return Profile;
}());
Profile = __decorate([
    core_1.Component({
        templateUrl: 'app/components/profile/profile.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService, forms_1.FormBuilder, api_1.ConfirmationService])
], Profile);
exports.Profile = Profile;
//# sourceMappingURL=profile.component.js.map