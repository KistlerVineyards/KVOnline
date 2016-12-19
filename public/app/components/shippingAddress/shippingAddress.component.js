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
var forms_1 = require("@angular/forms");
var customValidators_1 = require("../../services/customValidators");
var ng2_modal_1 = require("ng2-modal");
var api_1 = require("primeng/components/common/api");
var ShippingAddress = (function () {
    function ShippingAddress(appService, fb, confirmationService) {
        var _this = this;
        this.appService = appService;
        this.fb = fb;
        this.confirmationService = confirmationService;
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
        this.isVerifying = false;
        this.initShippingForm({});
        this.verifyAddressSub = this.appService.filterOn('get:smartyStreet').subscribe(function (d) {
            if (d.data.error) {
                //Authorization of vendor at smartyStreet failed. Maybe purchase of new slot required
                appService.showAlert(_this.alert, true, 'addressValidationUnauthorized');
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
        this.dataReadySubs = appService.behFilterOn('masters:download:success').subscribe(function (d) {
            _this.countries = _this.appService.getCountries();
            _this.isDataReady = true;
        });
        this.getSubscription = appService.filterOn("get:shipping:address")
            .subscribe(function (d) {
            _this.isVerifying = false;
            _this.addresses = JSON.parse(d.data).Table;
            _this.addresses[_this.radioIndex || 0].isSelected = true;
            console.log(d);
        });
        this.postSubscription = appService.filterOn("post:shipping:address")
            .subscribe(function (d) {
            _this.showMessage(d);
        });
        this.putSubscription = appService.filterOn("put:shipping:address")
            .subscribe(function (d) {
            _this.showMessage(d);
        });
    }
    ;
    ShippingAddress.prototype.showMessage = function (d) {
        this.isVerifying = false;
        if (d.data.error) {
            this.appService.showAlert(this.alert, true, 'addressSaveFailed');
        }
        else {
            this.appService.httpGet('get:shipping:address');
            this.initShippingForm({});
            this.messages = [];
            this.messages.push({
                severity: 'success',
                summary: 'Saved',
                detail: 'Data saved successfully'
            });
            this.shippingModal.close();
        }
    };
    ShippingAddress.prototype.initShippingForm = function (address) {
        this.shippingForm = this.fb.group({
            id: [address.shippid || ''],
            co: [address.co || ''],
            name: [address.name || '', forms_1.Validators.required],
            street1: [address.street1 || '', forms_1.Validators.required],
            street2: [address.street2 || ''],
            city: [address.city || '', forms_1.Validators.required],
            state: [address.state || ''],
            zip: [address.zip || '', forms_1.Validators.required],
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
    ShippingAddress.prototype.verifyOrSubmit = function () {
        if (this.selectedCountryName == 'United States') {
            this.verify();
        }
        else {
            this.submit();
        }
    };
    ;
    ShippingAddress.prototype.verify = function () {
        var usAddress = {
            street: this.shippingForm.controls["street1"].value,
            street2: this.shippingForm.controls["street2"].value,
            city: this.shippingForm.controls["city"].value,
            state: this.shippingForm.controls["state"].value,
            zipcode: this.shippingForm.controls["zip"].value
        };
        this.isVerifying = true;
        this.appService.httpGet('get:smartyStreet', { usAddress: usAddress });
    };
    ;
    ShippingAddress.prototype.submit = function (isVerified) {
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
            isDefault: this.shippingForm.controls['isDefault'].value,
            isAddressVerified: isVerified || false
        };
        addr.isoCode = this.countries.filter(function (d) { return d.countryName == _this.selectedCountryName; })[0].isoCode;
        if (addr.id) {
            this.appService.httpPut('put:shipping:address', { address: addr });
        }
        else {
            this.appService.httpPost('post:shipping:address', { address: addr });
        }
    };
    ;
    ShippingAddress.prototype.addAddress = function () {
        this.initShippingForm({ country: 'United States' });
        this.shippingModal.open();
    };
    ;
    ShippingAddress.prototype.cancel = function () {
        this.appService.showAlert(this.alert, false);
        this.shippingModal.close();
    };
    ;
    ShippingAddress.prototype.click = function (radioButton, index) {
        radioButton.checked = true;
        this.radioIndex = index;
    };
    ;
    ShippingAddress.prototype.invalidAddressConfirmBeforeSave = function () {
        var _this = this;
        this.confirmationService.confirm({
            message: this.appService.getMessage('mess:confirm:save:invalid:address'),
            accept: function () {
                _this.submit(false);
            }
        });
    };
    ;
    ShippingAddress.prototype.editedAddressConfirmBeforeSave = function (data) {
        var _this = this;
        var street = (data.street_predirection || '').concat(' ', data.primary_number || '', ' ', data.street_name || '', ' ', data.street_suffix || '', ' ', data.street_postdirection || '');
        var addr = street.concat(", ", data.city_name, ", ", data.state_abbreviation, ", ", data.zipcode);
        this.confirmationService.confirm({
            message: this.appService.getMessage('mess:confirm:save:edited:address').concat(addr),
            accept: function () {
                // let street = (data.street_predirection || '').concat(' ', data.primary_number, ' ', data.street_name, ' ', data.street_suffix, ' ', data.street_postdirection);
                _this.shippingForm.controls["street1"].setValue(street);
                _this.shippingForm.controls["city"].setValue(data.city_name);
                _this.shippingForm.controls["state"].setValue(data.state_abbreviation);
                _this.shippingForm.controls["zip"].setValue(data.zipcode);
                _this.appService.showAlert(_this.alert, false);
                _this.submit(true);
            }
        });
    };
    ;
    ShippingAddress.prototype.ngOnDestroy = function () {
        this.getSubscription.unsubscribe();
        this.postSubscription.unsubscribe();
        this.putSubscription.unsubscribe();
        this.dataReadySubs.unsubscribe();
        this.verifyAddressSub.unsubscribe();
    };
    ;
    return ShippingAddress;
}());
__decorate([
    core_1.ViewChild('shippingModal'),
    __metadata("design:type", ng2_modal_1.Modal)
], ShippingAddress.prototype, "shippingModal", void 0);
ShippingAddress = __decorate([
    core_1.Component({
        templateUrl: 'app/components/shippingAddress/shippingAddress.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService, forms_1.FormBuilder, api_1.ConfirmationService])
], ShippingAddress);
exports.ShippingAddress = ShippingAddress;
//# sourceMappingURL=shippingAddress.component.js.map