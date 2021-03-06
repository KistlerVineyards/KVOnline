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
//import { TextMaskModule } from 'angular2-text-mask';
var ShippingAddress = (function () {
    //public mask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
    function ShippingAddress(appService, fb, confirmationService) {
        this.appService = appService;
        this.fb = fb;
        this.confirmationService = confirmationService;
        this.alert = {
            show: false,
            type: 'danger',
            message: this.appService.getValidationErrorMessage('invalidAddress')
        };
        this.selectedISOCode = '';
        this.selectedCountryName = 'United States';
        this.selectedCountryObj = {};
        this.isDataReady = false;
        this.messages = [];
        this.isVerifying = false;
        this.initShippingForm({});
    }
    ;
    ShippingAddress.prototype.initSubscriptions = function () {
        var _this = this;
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
                    //this.invalidAddressConfirmBeforeSave();
                    _this.smartyStreeData = false;
                    _this.unverifiedAddress = true;
                }
                else {
                    //verification succeeded with maybe corrected address as return
                    var data = d.data[0].components;
                    //this.editedAddressConfirmBeforeSave(data);
                    var street = '';
                    if (data.primary_number) {
                        street = data.primary_number;
                    }
                    if (data.street_predirection) {
                        street += " " + data.street_predirection;
                    }
                    if (data.street_name) {
                        street += " " + data.street_name;
                    }
                    if (data.street_suffix) {
                        street += " " + data.street_suffix;
                    }
                    if (data.street_postdirection) {
                        street += " " + data.street_postdirection;
                    }
                    street = street.trim();
                    if (_this.shippingForm.controls['street2'].value) {
                        street = street.concat('\n', _this.shippingForm.controls['street2'].value);
                    }
                    //street = street.concat('\n', this.shippingForm.controls['street2'].value);
                    var addr = street.concat("\n", data.city_name, ", ", data.state_abbreviation, ", ", data.zipcode);
                    _this.smartyStreeData = data;
                    _this.addressMessage = addr;
                    _this.confirmAddress = true;
                }
            }
        });
        this.dataReadySubs = this.appService.behFilterOn('masters:download:success').subscribe(function (d) {
            _this.countries = _this.appService.getCountries();
            _this.isDataReady = true;
        });
        this.getSubscription = this.appService.filterOn("get:shipping:address")
            .subscribe(function (d) {
            _this.isVerifying = false;
            _this.addresses = JSON.parse(d.data).Table;
            if (_this.addresses.length > 0) {
                if (_this.radioIndex > (_this.addresses.length - 1)) {
                    _this.radioIndex = _this.addresses.length - 1;
                }
                _this.addresses[_this.radioIndex || 0].isSelected = true;
                _this.addresses = JSON.parse(d.data).Table.map(function (value, i) {
                    if (!value.country) {
                        value.country = "United States";
                    }
                    return (value);
                });
            }
        });
        this.postSubscription = this.appService.filterOn("post:shipping:address")
            .subscribe(function (d) {
            _this.showMessage(d);
        });
        this.putSubscription = this.appService.filterOn("put:shipping:address")
            .subscribe(function (d) {
            _this.showMessage(d);
        });
        this.postDeleteSubscription = this.appService.filterOn("post:delete:shipping:address")
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
                // this.appService.doGrowl(this.messages, 'error', 'Error', 'Deletion of address failed at server')
                _this.messages = [];
                _this.messages.push({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Address could not be deleted'
                });
            }
            else {
                _this.appService.httpGet('get:shipping:address');
                _this.messages = [];
                _this.messages.push({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Data saved successfully'
                });
            }
        });
    };
    ;
    ShippingAddress.prototype.confirmRemove = function (address) {
        var _this = this;
        this.confirmationService.confirm({
            message: 'Are you sure to delete this address?',
            accept: function () {
                _this.appService.httpPost('post:delete:shipping:address', { sqlKey: 'DeleteShippingAddress', sqlParms: { id: address.shippid } });
            }
        });
    };
    ;
    ShippingAddress.prototype.showMessage = function (d) {
        this.isVerifying = false;
        if (d.data.error) {
            this.appService.showAlert(this.alert, true, 'addressSaveFailed');
        }
        else {
            this.appService.showAlert(this.alert, false);
            this.appService.httpGet('get:shipping:address');
            this.initShippingForm({});
            this.messages = [];
            this.messages.push({
                severity: 'success',
                summary: 'Saved',
                detail: 'Data saved successfully'
            });
            // this.appService.doGrowl(this.messages, 'success', 'Saved', 'Data saved successfully');            
            this.shippingModal.close();
        }
    };
    ;
    ShippingAddress.prototype.initShippingForm = function (address) {
        if (this.isDataReady) {
            try {
                var userselectedCountry = this.countries.filter(function (d) { return d.countryName == address.country; });
                if (userselectedCountry.length == 0) {
                    address.country = "United States";
                    address.isoCode = "US";
                }
            }
            catch (ex) {
                address.country = "United States";
                address.isoCode = "US";
            }
        }
        this.shippingForm = this.fb.group({
            id: [address.shippid || ''],
            co: [address.co || ''],
            name: [address.name || '', forms_1.Validators.required],
            street1: [address.street1 || '', forms_1.Validators.required],
            street2: [address.street2 || ''],
            city: [address.city || '', forms_1.Validators.required],
            state: [address.state || '', customValidators_1.CustomValidators.StateLengthValidator],
            zip: [address.zip || '', forms_1.Validators.required],
            countryName: [address.country || '', forms_1.Validators.required],
            isoCode: [address.isoCode || ''],
            phone: [address.phone || '', [forms_1.Validators.required, customValidators_1.CustomValidators.phoneValidator]],
            isDefault: [address.isDefault || false]
        });
        this.shippingForm.controls['phone'].markAsDirty();
        this.selectedCountryName = address.country;
        if (!address.phone) {
            //separate reset is required to clear the input mask control
            this.shippingForm.controls['phone'].reset();
        }
    };
    ;
    ShippingAddress.prototype.ngOnInit = function () {
        this.initSubscriptions();
        this.appService.httpGet('get:shipping:address');
    };
    ;
    ShippingAddress.prototype.edit = function (address) {
        this.selectedISOCode = address.isoCode;
        this.initShippingForm(address);
        this.shippingModal.open();
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
        try {
            var userselectedCountry = this.countries.filter(function (d) { return d.countryName == _this.selectedCountryName; });
            if (userselectedCountry.length == 0) {
                this.selectedCountryName = "United States";
            }
        }
        catch (ex) {
            this.selectedCountryName = "United States";
        }
        var addr = {
            id: this.shippingForm.controls['id'].value,
            name: this.shippingForm.controls['name'].value,
            co: this.shippingForm.controls['co'].value ? this.shippingForm.controls['co'].value : '',
            street1: this.shippingForm.controls['street1'].value,
            street2: this.shippingForm.controls['street2'].value ? this.shippingForm.controls['street2'].value : '',
            city: this.shippingForm.controls['city'].value,
            state: this.shippingForm.controls['state'].value ? this.shippingForm.controls['state'].value : '',
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
        //close the dialog
        this.confirmAddress = false;
        this.unverifiedAddress = false;
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
    ShippingAddress.prototype.editedAddressConfirmBeforeSave = function () {
        if (this.smartyStreeData) {
            var data = this.smartyStreeData;
            //let street = (data.street_predirection || '').concat(' ', data.primary_number || '', ' ', data.street_name || '', ' ', data.street_suffix || '', ' ', data.street_postdirection || '');
            var street = '';
            if (data.primary_number) {
                street = data.primary_number;
            }
            if (data.street_predirection) {
                street += " " + data.street_predirection;
            }
            if (data.street_name) {
                street += " " + data.street_name;
            }
            if (data.street_suffix) {
                street += " " + data.street_suffix;
            }
            if (data.street_postdirection) {
                street += " " + data.street_postdirection;
            }
            street = street.trim();
            var addr = street.concat(", ", data.city_name, ", ", data.state_abbreviation, ", ", data.zipcode);
            this.shippingForm.controls["street1"].setValue(street);
            this.shippingForm.controls["city"].setValue(data.city_name);
            this.shippingForm.controls["state"].setValue(data.state_abbreviation);
            this.shippingForm.controls["zip"].setValue(data.zipcode);
            this.appService.showAlert(this.alert, false);
            this.submit(true);
        }
        else {
            this.submit(false);
        }
    };
    ;
    /*
    editedAddressConfirmBeforeSave(data) {
        //let street = (data.street_predirection || '').concat(' ', data.primary_number || '', ' ', data.street_name || '', ' ', data.street_suffix || '', ' ', data.street_postdirection || '');
        let street ='';
        if(data.primary_number)
        {
            street = data.primary_number;
        }
        if(data.street_predirection)
        {
            street += " " + data.street_predirection;
        }
        if(data.street_name)
        {
            street += " " + data.street_name;
        }
        if(data.street_suffix)
        {
            street += " " + data.street_suffix;
        }
        if(data.street_postdirection)
        {
            street += " " + data.street_postdirection;
        }
        street = street.trim();
        let addr = street.concat(", ", data.city_name, ", ", data.state_abbreviation, ", ", data.zipcode)
        this.confirmationService.confirm({
            message: this.appService.getMessage('mess:confirm:save:edited:address').concat(addr),
            accept: () => {
                // let street = (data.street_predirection || '').concat(' ', data.primary_number, ' ', data.street_name, ' ', data.street_suffix, ' ', data.street_postdirection);
                this.shippingForm.controls["street1"].setValue(street);
                this.shippingForm.controls["city"].setValue(data.city_name);
                this.shippingForm.controls["state"].setValue(data.state_abbreviation);
                this.shippingForm.controls["zip"].setValue(data.zipcode);
                this.appService.showAlert(this.alert, false);
                this.submit(true);
            }
        });
    };*/
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