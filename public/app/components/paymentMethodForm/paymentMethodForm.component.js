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
var util_1 = require("../../services/util");
var api_1 = require("primeng/components/common/api");
//import { TextMaskModule } from 'angular2-text-mask';
var PaymentMethodForm = (function () {
    function PaymentMethodForm(appService, fb, confirmationService) {
        var _this = this;
        this.appService = appService;
        this.fb = fb;
        this.confirmationService = confirmationService;
        this.alert = {};
        this.creditCardTypes = [];
        this.isDataReady = false;
        this.selectedISOCode = '';
        this.selectedCreditCardType = '';
        // console.log(this.testData);
        this.dataReadySubs = appService.behFilterOn('masters:download:success').subscribe(function (d) {
            _this.countries = _this.appService.getCountries();
            _this.creditCardTypes = _this.appService.getSetting('creditCardTypes');
            _this.isDataReady = true;
        });
        this.getDefaultBillingAddressSub = appService.filterOn("get:default:billing:address")
            .subscribe(function (d) {
            if (d.data.error) {
                console.log('Error occured fetching default billing address');
            }
            else {
                _this.initPayMethodForm();
                _this.alert = {};
                var defaultBillingAddress = JSON.parse(d.data).Table[0] || {};
                /*this.payMethodForm.controls['street1'].setValue(defaultBillingAddress.street1);
                this.payMethodForm.controls['street2'].setValue(defaultBillingAddress.street2);
                this.payMethodForm.controls['city'].setValue(defaultBillingAddress.city);
                this.payMethodForm.controls['state'].setValue(defaultBillingAddress.state);
                this.payMethodForm.controls['zip'].setValue(defaultBillingAddress.zip);
                this.payMethodForm.controls['phone'].setValue(defaultBillingAddress.phone);
                this.payMethodForm.controls['countryName'].setValue(defaultBillingAddress.isoCode);
                this.selectedISOCode = defaultBillingAddress.isoCode;
                */
                _this.payMethodForm.controls['street1'].setValue(defaultBillingAddress.mailingAddress1);
                _this.payMethodForm.controls['street2'].setValue(defaultBillingAddress.mailingAddress2);
                _this.payMethodForm.controls['city'].setValue(defaultBillingAddress.mailingCity);
                _this.payMethodForm.controls['state'].setValue(defaultBillingAddress.mailingState);
                _this.payMethodForm.controls['zip'].setValue(defaultBillingAddress.mailingZip);
                _this.payMethodForm.controls['phone'].setValue(defaultBillingAddress.phone);
                _this.payMethodForm.controls['countryName'].setValue(defaultBillingAddress.mailingISOCode);
                _this.selectedISOCode = defaultBillingAddress.mailingISOCode;
                _this.reset();
            }
        });
        this.postPayMethodSub = appService.filterOn("post:payment:method")
            .subscribe(function (d) {
            if (d.data.error) {
                _this.appService.showAlert(_this.alert, true, 'payMethodInsertFailed');
            }
            else {
                _this.appService.emit('select:new:card', _this.newCard);
                _this.initPayMethodForm();
            }
        });
    }
    ;
    PaymentMethodForm.prototype.initPayMethodForm = function () {
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
            isDefault: [false],
            isSaveForLaterUse: [false]
        }, { validator: customValidators_1.CustomValidators.expiryMonthYearValidator });
        this.payMethodForm.controls['phone'].markAsDirty();
        this.payMethodForm.controls['ccType'].markAsDirty();
    };
    ;
    PaymentMethodForm.prototype.getFormFromNewCard = function () {
        this.payMethodForm.controls['cardName'].setValue(this.newCard.cardName);
        this.payMethodForm.controls['ccFirstName'].setValue(this.newCard.ccFirstName);
        this.payMethodForm.controls['ccLastName'].setValue(this.newCard.ccLastName);
        this.payMethodForm.controls['ccType'].setValue(this.newCard.ccType);
        this.payMethodForm.controls['ccNumber'].setValue(this.newCard.ccNumber);
        this.payMethodForm.controls['ccExpiryMonth'].setValue(this.newCard.ccExpiryMonth);
        this.payMethodForm.controls['ccExpiryYear'].setValue(this.newCard.ccExpiryYear);
        this.payMethodForm.controls['ccSecurityCode'].setValue(this.newCard.ccSecurityCode);
        this.payMethodForm.controls['co'].setValue(this.newCard.co);
        this.payMethodForm.controls['street1'].setValue(this.newCard.street1);
        this.payMethodForm.controls['street2'].setValue(this.newCard.street2);
        this.payMethodForm.controls['city'].setValue(this.newCard.city);
        this.payMethodForm.controls['state'].setValue(this.newCard.state);
        this.payMethodForm.controls['zip'].setValue(this.newCard.zip);
        this.payMethodForm.controls['countryName'].setValue(this.newCard.country);
        this.payMethodForm.controls['isoCode'].setValue(this.newCard.isoCode);
        this.payMethodForm.controls['phone'].setValue(this.newCard.phone);
        this.payMethodForm.controls['isSaveForLaterUse'].setValue(this.newCard.isSaveForLaterUse);
    };
    ;
    //@ViewChild('isSaveForLaterUse') isSaveForLaterUse: any;
    PaymentMethodForm.prototype.getNewCardFromForm = function () {
        var _this = this;
        this.newCard.cardName = this.payMethodForm.controls['cardName'].value;
        this.newCard.ccFirstName = this.payMethodForm.controls['ccFirstName'].value;
        this.newCard.ccLastName = this.payMethodForm.controls['ccLastName'].value;
        this.newCard.ccType = this.payMethodForm.controls['ccType'].value;
        this.newCard.ccNumber = this.payMethodForm.controls['ccNumber'].value;
        this.newCard.ccExpiryMonth = this.payMethodForm.controls['ccExpiryMonth'].value;
        this.newCard.ccExpiryYear = this.payMethodForm.controls['ccExpiryYear'].value;
        this.newCard.ccSecurityCode = this.payMethodForm.controls['ccSecurityCode'].value;
        this.newCard.co = this.payMethodForm.controls['co'].value;
        this.newCard.street1 = this.payMethodForm.controls['street1'].value;
        this.newCard.street2 = this.payMethodForm.controls['street2'].value;
        this.newCard.city = this.payMethodForm.controls['city'].value;
        this.newCard.state = this.payMethodForm.controls['state'].value;
        this.newCard.zip = this.payMethodForm.controls['zip'].value;
        this.newCard.country = this.payMethodForm.controls['countryName'].value;
        this.newCard.isoCode = this.payMethodForm.controls['isoCode'].value;
        this.newCard.phone = this.payMethodForm.controls['phone'].value;
        this.newCard.isSaveForLaterUse = this.payMethodForm.controls['isSaveForLaterUse'].value;
        this.newCard.isoCode = this.selectedISOCode;
        this.newCard.country = this.countries.filter(function (d) { return d.isoCode == _this.selectedISOCode; })[0].countryName;
    };
    ;
    PaymentMethodForm.prototype.ngOnInit = function () {
        this.initPayMethodForm();
        this.payMethodForm.controls["countryName"].setValue("US");
        this.selectedISOCode = "US";
        this.payMethodForm.controls['ccType'].setValue('Visa');
        this.selectedCreditCardType = "Visa";
        if (Object.keys(this.newCard).length > 0) {
            this.getFormFromNewCard();
        }
    };
    ;
    PaymentMethodForm.prototype.isNumber = function (evt) {
        evt = (evt) ? evt : window.event;
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    };
    ;
    PaymentMethodForm.prototype.logCheckbox = function (element) {
        //var t=100;
        //t=t+1;
        //alert("3rd test");
        //element.focus();
        //alert("1st alert.");
        //document.querySelector("btnsave").focus();
        //alert("2nd alert.");
        //this.log += `Checkbox ${element.value} was ${element.checked ? '' : 'un'}checked\n`
    };
    PaymentMethodForm.prototype.cancel = function () {
        this.initPayMethodForm();
        this.appService.request('close:pay:method:modal')();
    };
    ;
    PaymentMethodForm.prototype.reset = function () {
        this.payMethodForm.controls["countryName"].setValue("US");
        this.selectedISOCode = "US";
        this.payMethodForm.controls['ccType'].setValue('Visa');
        this.selectedCreditCardType = "Visa";
    };
    ;
    PaymentMethodForm.prototype.select = function () {
        this.getNewCardFromForm();
        if (this.newCard.isSaveForLaterUse) {
            this.saveCardForLaterUse();
        }
        else {
            this.appService.emit('select:new:card', this.newCard);
            this.initPayMethodForm();
        }
    };
    ;
    PaymentMethodForm.prototype.saveCardForLaterUse = function () {
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
            state: this.payMethodForm.controls['state'].value,
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
    PaymentMethodForm.prototype.ngOnDestroy = function () {
        this.dataReadySubs.unsubscribe();
        this.getDefaultBillingAddressSub.unsubscribe();
        this.postPayMethodSub.unsubscribe();
    };
    ;
    return PaymentMethodForm;
}());
__decorate([
    core_1.Input('newCard'),
    __metadata("design:type", Object)
], PaymentMethodForm.prototype, "newCard", void 0);
__decorate([
    core_1.Input('defaultBillingAddress'),
    __metadata("design:type", Object)
], PaymentMethodForm.prototype, "defaultBillingAddress", void 0);
PaymentMethodForm = __decorate([
    core_1.Component({
        selector: 'paymentMethodForm',
        templateUrl: 'app/components/paymentMethodForm/paymentMethodForm.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService, forms_1.FormBuilder, api_1.ConfirmationService])
], PaymentMethodForm);
exports.PaymentMethodForm = PaymentMethodForm;
//# sourceMappingURL=paymentMethodForm.component.js.map