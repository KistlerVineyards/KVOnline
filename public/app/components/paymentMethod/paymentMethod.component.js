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
var util_1 = require("../../services/util");
var forms_1 = require("@angular/forms");
var customValidators_1 = require("../../services/customValidators");
var ng2_modal_1 = require("ng2-modal");
var api_1 = require("primeng/components/common/api");
//import { TextMaskModule } from 'angular2-text-mask';
var PaymentMethod = (function () {
    //public mask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
    function PaymentMethod(appService, fb, confirmationService) {
        var _this = this;
        this.appService = appService;
        this.fb = fb;
        this.confirmationService = confirmationService;
        this.alert = {};
        this.selectedISOCode = '';
        this.isDataReady = false;
        this.messages = [];
        this.display = false;
        this.creditCardTypes = [];
        this.initPayMethodForm();
        this.getAllPaymentMethodsSub = appService.filterOn("get:payment:method")
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d);
            }
            else {
                _this.payMethods = JSON.parse(d.data).Table;
                _this.payMethods = JSON.parse(d.data).Table.map(function (value, i) {
                    value.ccNumber = "x" + value.ccNumber.substring(value.ccNumber.length - 4, value.ccNumber.length);
                    return (value);
                });
            }
        });
        this.dataReadySubs = appService.behFilterOn('masters:download:success').subscribe(function (d) {
            _this.countries = _this.appService.getCountries();
            _this.creditCardTypes = _this.appService.getSetting('creditCardTypes');
            _this.isDataReady = true;
        });
        this.postPayMethodSub = appService.filterOn("post:payment:method")
            .subscribe(function (d) {
            if (d.data.error) {
                _this.appService.showAlert(_this.alert, true, 'payMethodInsertFailed');
            }
            else {
                _this.initPayMethodForm();
                _this.appService.showAlert(_this.alert, false);
                _this.getPaymentMethod();
                _this.messages = [];
                _this.messages.push({
                    severity: 'success',
                    summary: 'Saved',
                    detail: 'Data saved successfully'
                });
                _this.payMethodModal.close();
            }
        });
        this.deletePayMethodSub = appService.filterOn("post:delete:payment:method")
            .subscribe(function (d) {
            if (d.data.error) {
                console.log("Error occured");
            }
            else {
                _this.getPaymentMethod();
            }
        });
        this.setDefaultPayMethodSub = appService.filterOn("post:set:default:payment:method")
            .subscribe(function (d) {
            if (d.data.error) {
                console.log('Error occured');
            }
            else {
                console.log('Successfully set as default');
            }
        });
        this.getDefaultBillingAddressSub = appService.filterOn("get:default:billing:address")
            .subscribe(function (d) {
            if (d.data.error) {
                console.log('Error occured fetching default billing address');
            }
            else {
                var defaultBillingAddress = JSON.parse(d.data).Table[0] || {};
                /*this.payMethodForm.controls['street1'].setValue(defaultBillingAddress.street1);
                this.payMethodForm.controls['street2'].setValue(defaultBillingAddress.street2);
                this.payMethodForm.controls['city'].setValue(defaultBillingAddress.city);
                this.payMethodForm.controls['state'].setValue(defaultBillingAddress.state);
                this.payMethodForm.controls['zip'].setValue(defaultBillingAddress.zip);
                // this.payMethodForm.controls['phone'].reset();
                this.payMethodForm.controls['phone'].setValue(defaultBillingAddress.phone);
                this.payMethodForm.controls['countryName'].setValue(defaultBillingAddress.isoCode);
                this.selectedISOCode = defaultBillingAddress.isoCode;*/
                _this.payMethodForm.controls['street1'].setValue(defaultBillingAddress.mailingAddress1);
                _this.payMethodForm.controls['street2'].setValue(defaultBillingAddress.mailingAddress2);
                _this.payMethodForm.controls['city'].setValue(defaultBillingAddress.mailingCity);
                _this.payMethodForm.controls['state'].setValue(defaultBillingAddress.mailingState);
                _this.payMethodForm.controls['zip'].setValue(defaultBillingAddress.mailingZip);
                _this.payMethodForm.controls['phone'].setValue(defaultBillingAddress.phone);
                _this.payMethodForm.controls['countryName'].setValue(defaultBillingAddress.mailingISOCode);
                _this.selectedISOCode = defaultBillingAddress.mailingISOCode;
            }
        });
    }
    ;
    PaymentMethod.prototype.confirm = function (card) {
        var _this = this;
        this.confirmationService.confirm({
            message: 'Are you sure that you want to perform this action?',
            accept: function () {
                _this.appService.httpPost('post:delete:payment:method', { sqlKey: 'DeletePaymentMethod', sqlParms: { id: card.id } });
            }
        });
    };
    ;
    PaymentMethod.prototype.initPayMethodForm = function () {
        this.year = (new Date()).getFullYear();
        this.month = (new Date()).getMonth() + 1;
        this.payMethodForm = this.fb.group({
            id: [''],
            cardName: ['My Card', forms_1.Validators.required],
            ccFirstName: ['', [forms_1.Validators.required, customValidators_1.CustomValidators.CCFirstNameLengthValidator]],
            ccLastName: ['', [forms_1.Validators.required, customValidators_1.CustomValidators.CCLastNameLengthValidator]],
            ccType: ['', forms_1.Validators.required],
            ccNumber: ['', [forms_1.Validators.required, customValidators_1.CustomValidators.creditCardValidator]],
            ccExpiryMonth: [this.month, [forms_1.Validators.required, customValidators_1.CustomValidators.creditCardexpiryMonthValidator]],
            ccExpiryYear: [this.year, [forms_1.Validators.required, customValidators_1.CustomValidators.creditCardYearValidator]],
            ccSecurityCode: ['', [forms_1.Validators.required, customValidators_1.CustomValidators.creditCardSecurityCodeValidator]],
            co: [''],
            street1: ['', forms_1.Validators.required],
            street2: [''],
            city: ['', forms_1.Validators.required],
            state: ['', customValidators_1.CustomValidators.StateLengthValidator],
            zip: ['', forms_1.Validators.required],
            countryName: ['', forms_1.Validators.required],
            isoCode: [''],
            phone: ['', [forms_1.Validators.required, customValidators_1.CustomValidators.phoneValidator]],
            isDefault: [false]
        }, { validator: customValidators_1.CustomValidators.expiryMonthYearValidator });
        this.payMethodForm.controls['phone'].markAsDirty();
        this.payMethodForm.controls['ccType'].markAsDirty();
    };
    ;
    PaymentMethod.prototype.isNumber = function (evt) {
        evt = (evt) ? evt : window.event;
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    };
    ;
    PaymentMethod.prototype.addPayMethod = function () {
        this.initPayMethodForm();
        this.payMethodForm.controls["countryName"].setValue("US");
        this.selectedISOCode = "US";
        this.payMethodForm.controls['ccType'].setValue('Visa');
        this.payMethodModal.open();
        var body = {};
        body.data = JSON.stringify({ sqlKey: 'GetDefaultBillingAddressForCard' });
        this.appService.httpGet('get:default:billing:address', body);
    };
    ;
    PaymentMethod.prototype.cancel = function () {
        this.appService.showAlert(this.alert, false);
        this.payMethodModal.close(true);
    };
    PaymentMethod.prototype.submit = function () {
        var _this = this;
        var firstName = this.payMethodForm.controls['ccFirstName'].value || '';
        var lastName = this.payMethodForm.controls['ccLastName'].value || '';
        var ccNumber = this.payMethodForm.controls['ccNumber'].value.toString();
        //ccNumber = ccNumber.substring(0, ccNumber.length -4).replace(new RegExp("[0-9]", "g"), "X") + ccNumber.substring(ccNumber.length -4, ccNumber.length);
        //ccNumber = ccNumber.toString();
        ccNumber = util_1.Util.getMaskedCCNumber(ccNumber);
        //ccNumber = ccNumber + ccNumberactual.slice(-4);
        var payMethod = {
            cardName: this.payMethodForm.controls['cardName'].value,
            ccFirstName: this.payMethodForm.controls['ccFirstName'].value,
            ccLastName: this.payMethodForm.controls['ccLastName'].value,
            ccType: this.payMethodForm.controls['ccType'].value,
            ccNumber: ccNumber,
            encryptedCCNumber: this.payMethodForm.controls['ccNumber'].value,
            ccExpiryMonth: this.payMethodForm.controls['ccExpiryMonth'].value,
            ccExpiryYear: this.payMethodForm.controls['ccExpiryYear'].value,
            ccSecurityCode: this.payMethodForm.controls['ccSecurityCode'].value,
            name: firstName + ' ' + lastName,
            street1: this.payMethodForm.controls['street1'].value,
            street2: this.payMethodForm.controls['street2'].value ? this.payMethodForm.controls['street2'].value : '',
            city: this.payMethodForm.controls['city'].value,
            state: this.payMethodForm.controls['state'].value ? this.payMethodForm.controls['state'].value : '',
            zip: this.payMethodForm.controls['zip'].value,
            country: '',
            isoCode: '',
            phone: this.payMethodForm.controls['phone'].value,
            isDefault: this.payMethodForm.controls['isDefault'].value
        };
        payMethod.isoCode = this.selectedISOCode;
        payMethod.country = this.countries.filter(function (d) { return d.isoCode == _this.selectedISOCode; })[0].countryName;
        this.appService.httpPost('post:payment:method', { sqlKey: 'InsertPaymentMethod', sqlParms: payMethod });
    };
    ;
    PaymentMethod.prototype.setDefault = function (card) {
        this.payMethods.forEach(function (value, i) { return value.isDefault = false; });
        card.isDefault = true;
        this.appService.httpPost('post:set:default:payment:method', { sqlKey: 'SetDefaultPaymentMethod', sqlParms: { id: card.id } });
    };
    PaymentMethod.prototype.ngOnInit = function () {
        this.getPaymentMethod();
    };
    ;
    PaymentMethod.prototype.getPaymentMethod = function () {
        var body = {};
        body.data = JSON.stringify({ sqlKey: 'GetAllPaymentMethods' });
        this.appService.httpGet('get:payment:method', body);
    };
    PaymentMethod.prototype.ngOnDestroy = function () {
        this.getAllPaymentMethodsSub.unsubscribe();
        this.dataReadySubs.unsubscribe();
        this.postPayMethodSub.unsubscribe();
        this.deletePayMethodSub.unsubscribe();
        this.getDefaultBillingAddressSub.unsubscribe();
    };
    ;
    return PaymentMethod;
}());
__decorate([
    core_1.ViewChild('payMethodModal'),
    __metadata("design:type", ng2_modal_1.Modal)
], PaymentMethod.prototype, "payMethodModal", void 0);
PaymentMethod = __decorate([
    core_1.Component({
        templateUrl: 'app/components/paymentMethod/paymentMethod.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService, forms_1.FormBuilder, api_1.ConfirmationService])
], PaymentMethod);
exports.PaymentMethod = PaymentMethod;
//# sourceMappingURL=paymentMethod.component.js.map