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
var api_1 = require("primeng/components/common/api");
//import {TextMaskModule} from 'angular2-text-mask';
var ShippingAddressForm = (function () {
    function ShippingAddressForm(appService, fb, confirmationService) {
        this.appService = appService;
        this.fb = fb;
        this.confirmationService = confirmationService;
        this.mask = [
            '(',
            /[1-9]/,
            /\d/,
            /\d/,
            ')',
            ' ',
            /\d/,
            /\d/,
            /\d/,
            '-',
            /\d/,
            /\d/,
            /\d/,
            /\d/
        ];
        this.alert = {
            show: false,
            type: 'danger',
            message: this
                .appService
                .getValidationErrorMessage('invalidAddress')
        };
        this.isDataReady = false;
        this.isVerifying = false;
        this.address = {};
        this.initShippingForm();
    }
    ;
    ShippingAddressForm.prototype.initShippingForm = function () {
        this.shippingForm = this
            .fb
            .group({
            id: [''],
            co: [''],
            name: [
                '', forms_1.Validators.required
            ],
            street1: [
                '', forms_1.Validators.required
            ],
            street2: [''],
            city: [
                '', forms_1.Validators.required
            ],
            state: ['', customValidators_1.CustomValidators.StateLengthValidator],
            zip: [
                '', forms_1.Validators.required
            ],
            countryName: [
                'United States', forms_1.Validators.required
            ],
            isoCode: [''],
            phone: [
                '',
                [forms_1.Validators.required, customValidators_1.CustomValidators.phoneValidator]
            ],
            isDefault: [false]
        });
        this
            .shippingForm
            .controls['phone']
            .markAsDirty();
    };
    ;
    ShippingAddressForm.prototype.initSubscriptions = function () {
        var _this = this;
        this.verifyAddressSub = this
            .appService
            .filterOn('get:smartyStreet')
            .subscribe(function (d) {
            if (d.data.error) {
                // Authorization of vendor at smartyStreet failed. Maybe purchase of new slot
                // required
                _this
                    .appService
                    .showAlert(_this.alert, true, 'addressValidationUnauthorized');
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
                    var addr = street.concat("\n", data.city_name, ", ", data.state_abbreviation, ", ", data.zipcode);
                    _this.smartyStreeData = data;
                    _this.addressMessage = addr;
                    _this.confirmAddress = true;
                }
            }
        });
        this.dataReadySubs = this
            .appService
            .behFilterOn('masters:download:success')
            .subscribe(function (d) {
            _this.countries = _this
                .appService
                .getCountries();
            _this.isDataReady = true;
        });
        this.postSubscription = this
            .appService
            .filterOn("post:shipping:address")
            .subscribe(function (d) {
            _this.isVerifying = false;
            if (d.data.error) {
                _this
                    .appService
                    .showAlert(_this.alert, true, 'addressSaveFailed');
            }
            else {
                //set iddentity key for address object
                _this.address.id = d.data.result;
                //pass message to parent window to close this modal
                _this
                    .appService
                    .emit('close:new:address:modal', {
                    success: true,
                    address: _this.address
                });
            }
        });
    };
    ;
    ShippingAddressForm.prototype.invalidAddressConfirmBeforeSave = function () {
        var _this = this;
        this
            .confirmationService
            .confirm({
            message: this
                .appService
                .getMessage('mess:confirm:save:invalid:address'),
            accept: function () {
                _this.submit(false);
            }
        });
    };
    ;
    ShippingAddressForm.prototype.editedAddressConfirmBeforeSave = function () {
        if (this.smartyStreeData) {
            var data = this.smartyStreeData;
            var street = (data.street_predirection || '').concat(' ', data.primary_number || '', ' ', data.street_name || '', ' ', data.street_suffix || '', ' ', data.street_postdirection || '');
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
        let addr = street.concat(", ", data.city_name, ", ", data.state_abbreviation, ", ", data.zipcode)
        this
            .confirmationService
            .confirm({
                message: this
                    .appService
                    .getMessage('mess:confirm:save:edited:address')
                    .concat(addr),
                accept: () => {
                    this
                        .shippingForm
                        .controls["street1"]
                        .setValue(street);
                    this
                        .shippingForm
                        .controls["city"]
                        .setValue(data.city_name);
                    this
                        .shippingForm
                        .controls["state"]
                        .setValue(data.state_abbreviation);
                    this
                        .shippingForm
                        .controls["zip"]
                        .setValue(data.zipcode);
                    this
                        .appService
                        .showAlert(this.alert, false);
                    this.submit(true);
                }
            });
    };*/
    ShippingAddressForm.prototype.verifyOrSubmit = function () {
        if (this.shippingForm.controls['countryName'].value == 'United States') {
            this.verify();
        }
        else {
            this.submit();
        }
    };
    ;
    ShippingAddressForm.prototype.verify = function () {
        var usAddress = {
            street: this.shippingForm.controls["street1"].value,
            street2: this.shippingForm.controls["street2"].value,
            city: this.shippingForm.controls["city"].value,
            state: this.shippingForm.controls["state"].value,
            zipcode: this.shippingForm.controls["zip"].value
        };
        this.isVerifying = true;
        this
            .appService
            .httpGet('get:smartyStreet', { usAddress: usAddress });
    };
    ;
    ShippingAddressForm.prototype.submit = function (isVerified) {
        var countryName = this.shippingForm.controls['countryName'].value;
        this.address = {
            id: this.shippingForm.controls['id'].value,
            name: this.shippingForm.controls['name'].value,
            co: this.shippingForm.controls['co'].value,
            street1: this.shippingForm.controls['street1'].value,
            street2: this.shippingForm.controls['street2'].value,
            city: this.shippingForm.controls['city'].value,
            state: this.shippingForm.controls['state'].value ? this.shippingForm.controls['state'].value : '',
            zip: this.shippingForm.controls['zip'].value,
            country: countryName,
            isoCode: '',
            phone: this.shippingForm.controls['phone'].value,
            isDefault: this.shippingForm.controls['isDefault'].value,
            isAddressVerified: isVerified || false
        };
        this.address.isoCode = this
            .countries
            .filter(function (d) { return d.countryName == countryName; })[0]
            .isoCode;
        this
            .appService
            .httpPost('post:shipping:address', { address: this.address });
        //close the dialog
        this.confirmAddress = false;
        this.unverifiedAddress = false;
    };
    ;
    ShippingAddressForm.prototype.cancel = function () {
        this
            .appService
            .showAlert(this.alert, false);
        this
            .appService
            .emit('close:new:address:modal', {});
    };
    ;
    ShippingAddressForm.prototype.ngOnInit = function () {
        var _this = this;
        this.initSubscriptions();
        //to reset the form when modal window opens
        this.openNewAddressModelSub = this
            .appService
            .behFilterOn('open:new:address:modal')
            .subscribe(function (d) {
            _this.initShippingForm();
        });
    };
    ;
    ShippingAddressForm.prototype.ngOnDestroy = function () {
        this
            .dataReadySubs
            .unsubscribe();
        this
            .openNewAddressModelSub
            .unsubscribe();
        this
            .postSubscription
            .unsubscribe();
        this
            .verifyAddressSub
            .unsubscribe();
    };
    ;
    return ShippingAddressForm;
}());
__decorate([
    core_1.Input('newAddress'),
    __metadata("design:type", Object)
], ShippingAddressForm.prototype, "newAddress", void 0);
ShippingAddressForm = __decorate([
    core_1.Component({ selector: 'shippingAddressForm', templateUrl: 'app/components/shippingAddressForm/shippingAddressForm.component.html' }),
    __metadata("design:paramtypes", [app_service_1.AppService, forms_1.FormBuilder, api_1.ConfirmationService])
], ShippingAddressForm);
exports.ShippingAddressForm = ShippingAddressForm;
//# sourceMappingURL=shippingAddressForm.component.js.map