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
var app_service_1 = require('../../services/app.service');
var forms_1 = require('@angular/forms');
var customValidators_1 = require('../../services/customValidators');
var ng2_modal_1 = require("ng2-modal");
var ShippingAddress = (function () {
    function ShippingAddress(appService, fb) {
        var _this = this;
        this.appService = appService;
        this.fb = fb;
        this.alert = {
            show: false,
            type: 'danger',
            message: this.appService.getValidationErrorMessage('invalidAddress')
        };
        this.selectedISOCode = '';
        this.selectedCountryName = '';
        this.selectedCountryObj = {};
        this.isDataReady = false;
        this.messages = [];
        this.isSaving = false;
        this.initShippingForm({});
        this.validateAddressSub = this.appService.filterOn('get:smartyStreet').subscribe(function (d) {
            if (d.data.error) {
                appService.showAlert(_this.alert, true, 'addressValidationUnauthorized');
                _this.isSaving = false;
            }
            else {
                if (d.data.length == 0) {
                    appService.showAlert(_this.alert, true, 'invalidAddress');
                    _this.isSaving = false;
                }
                else {
                    var data = d.data[0].components;
                    var street = (data.street_predirection || '').concat(' ', data.primary_number, ' ', data.street_name, ' ', data.street_suffix); //, ' ', data.street_postdirection);
                    if (data.street_postdirection) {
                        street = street.concat(' ', data.street_postdirection);
                    }
                    _this.shippingForm.controls["street1"].setValue(street);
                    _this.shippingForm.controls["city"].setValue(data.city_name);
                    _this.shippingForm.controls["state"].setValue(data.state_abbreviation);
                    _this.shippingForm.controls["zip"].setValue(data.zipcode);
                    _this.appService.showAlert(_this.alert, false);
                    _this.submit();
                }
            }
        });
        this.dataReadySubs = appService.behFilterOn('masters:download:success').subscribe(function (d) {
            _this.countries = _this.appService.getCountries();
            _this.isDataReady = true;
        });
        this.getSubscription = appService.filterOn("get:shipping:address")
            .subscribe(function (d) {
            _this.isSaving = false;
            _this.addresses = JSON.parse(d.data).Table;
            console.log(d);
        });
        this.postSubscription = appService.filterOn("post:shipping:address")
            .subscribe(function (d) {
            _this.isSaving = false;
            if (d.data.error) {
                _this.appService.showAlert(_this.alert, true, 'addressSaveFailed');
            }
            else {
                _this.appService.httpGet('get:shipping:address');
                _this.initShippingForm({});
                //this.appService.showAlert(this.alert, false);
                _this.messages = [];
                _this.messages.push({
                    severity: 'success',
                    summary: 'Saved',
                    detail: 'Data saved successfully'
                });
                _this.shippingModal.close();
            }
        });
        this.putSubscription = appService.filterOn("put:shipping:address")
            .subscribe(function (d) {
            _this.isSaving = false;
            if (d.data.error) {
                _this.appService.showAlert(_this.alert, true, 'addressSaveFailed');
            }
            else {
                _this.appService.httpGet('get:shipping:address');
                _this.initShippingForm({});
                _this.messages = [];
                _this.messages.push({
                    severity: 'success',
                    summary: 'Saved',
                    detail: 'Data saved successfully'
                });
                //this.appService.showAlert(this.alert, false);
                _this.shippingModal.close();
            }
        });
    }
    ;
    ShippingAddress.prototype.initShippingForm = function (address) {
        this.shippingForm = this.fb.group({
            id: [address.shippid || ''],
            co: [address.co || ''],
            name: [address.name || '', forms_1.Validators.required],
            street1: [address.street1 || '', forms_1.Validators.required],
            street2: [address.street2 || ''],
            city: [address.city || '', forms_1.Validators.required],
            state: [address.state || ''],
            zip: [address.zip || '', [forms_1.Validators.required, customValidators_1.CustomValidators.usZipCodeValidator]],
            countryName: [address.country || '', forms_1.Validators.required],
            isoCode: [address.isoCode || ''],
            phone: [address.phone || '', [forms_1.Validators.required, customValidators_1.CustomValidators.phoneValidator]],
            isDefault: [address.isDefault || false]
        });
        this.selectedCountryName = address.country;
    };
    ;
    ShippingAddress.prototype.ngOnInit = function () {
        this.appService.httpGet('get:shipping:address');
    };
    ;
    ShippingAddress.prototype.edit = function (address) {
        this.selectedISOCode = address.isoCode;
        this.initShippingForm(address);
        // this.shippingForm.patchValue({
        //     id: address.id,
        //     name: address.name,
        //     street1: address.street1,
        //     street2: address.street2,
        //     city: address.city,
        //     state: address.state,
        //     zip: address.zip,
        //     countryName: address.country,
        //     isoCode: address.isoCode,
        //     phone: address.phone,
        //     isDefault: address.isDefault
        // });        
        this.shippingModal.open();
    };
    ;
    ShippingAddress.prototype.delete = function (address) {
        if (confirm('Are you sure to delete this address')) {
            console.log('true');
        }
        else {
            console.log(false);
        }
    };
    ;
    ShippingAddress.prototype.submitting = function () {
        if (this.selectedCountryName == "United States") {
            this.verifybysmartyStreet();
        }
        else {
            this.submit();
        }
    };
    ;
    ShippingAddress.prototype.verifybysmartyStreet = function () {
        var usAddress = {
            street: this.shippingForm.controls["street1"].value,
            street2: this.shippingForm.controls["street2"].value,
            city: this.shippingForm.controls["city"].value,
            state: this.shippingForm.controls["state"].value,
            zipcode: this.shippingForm.controls["zip"].value
        };
        this.isSaving = true;
        this.appService.httpGet('get:smartyStreet', { usAddress: usAddress });
    };
    ;
    ShippingAddress.prototype.submit = function () {
        var _this = this;
        var addr = {
            id: this.shippingForm.controls['id'].value,
            name: this.shippingForm.controls['name'].value,
            street1: this.shippingForm.controls['street1'].value,
            street2: this.shippingForm.controls['street2'].value ? this.shippingForm.controls['street2'].value : '',
            city: this.shippingForm.controls['city'].value,
            state: this.shippingForm.controls['state'].value,
            zip: this.shippingForm.controls['zip'].value,
            country: this.selectedCountryName,
            isoCode: '',
            phone: this.shippingForm.controls['phone'].value,
            isDefault: this.shippingForm.controls['isDefault'].value
        };
        //addr.isoCode = this.selectedISOCode;
        addr.isoCode = this.countries.filter(function (d) { return d.countryName == _this.selectedCountryName; })[0].isoCode;
        //addr.country = this.countries.filter(d => d.isoCode == this.selectedISOCode)[0].countryName;
        if (addr.id) {
            this.appService.httpPut('put:shipping:address', { address: addr });
        }
        else {
            this.appService.httpPost('post:shipping:address', { address: addr });
        }
    };
    ;
    ShippingAddress.prototype.addAddress = function () {
        var addr = {
            country: this.countries.filter(function (d) { return d.isoCode == "US"; })[0].countryName,
            isoCode: "US",
        };
        this.initShippingForm(addr);
        this.shippingModal.open();
    };
    ;
    ShippingAddress.prototype.cancel = function () {
        this.appService.showAlert(this.alert, false);
        this.shippingModal.close();
    };
    ;
    ShippingAddress.prototype.ngOnDestroy = function () {
        this.getSubscription.unsubscribe();
        this.postSubscription.unsubscribe();
        this.putSubscription.unsubscribe();
        this.dataReadySubs.unsubscribe();
        this.validateAddressSub.unsubscribe();
    };
    ;
    __decorate([
        core_1.ViewChild('shippingModal'), 
        __metadata('design:type', ng2_modal_1.Modal)
    ], ShippingAddress.prototype, "shippingModal", void 0);
    ShippingAddress = __decorate([
        core_1.Component({
            templateUrl: 'app/components/shippingAddress/shippingAddress.component.html'
        }), 
        __metadata('design:paramtypes', [app_service_1.AppService, forms_1.FormBuilder])
    ], ShippingAddress);
    return ShippingAddress;
}());
exports.ShippingAddress = ShippingAddress;
//# sourceMappingURL=shippingAddress.component.js.map