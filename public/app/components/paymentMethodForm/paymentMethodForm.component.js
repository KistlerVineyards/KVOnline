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
var PaymentMethodForm = (function () {
    function PaymentMethodForm(appService, fb, confirmationService) {
        var _this = this;
        this.appService = appService;
        this.fb = fb;
        this.confirmationService = confirmationService;
        this.creditCardTypes = [];
        this.isDataReady = false;
        this.selectedISOCode = '';
        this.selectedCreditCardType = '';
        this.mask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
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
                var defaultBillingAddress = JSON.parse(d.data).Table[0] || {};
                _this.payMethodForm.controls['street1'].setValue(defaultBillingAddress.street1);
                _this.payMethodForm.controls['street2'].setValue(defaultBillingAddress.street2);
                _this.payMethodForm.controls['city'].setValue(defaultBillingAddress.city);
                _this.payMethodForm.controls['state'].setValue(defaultBillingAddress.state);
                _this.payMethodForm.controls['zip'].setValue(defaultBillingAddress.zip);
                _this.payMethodForm.controls['phone'].setValue(defaultBillingAddress.phone);
                _this.payMethodForm.controls['countryName'].setValue(defaultBillingAddress.isoCode);
                _this.selectedISOCode = defaultBillingAddress.isoCode;
            }
        });
    }
    ;
    PaymentMethodForm.prototype.initPayMethodForm = function () {
        this.year = (new Date()).getFullYear();
        this.month = (new Date()).getMonth() + 1;
        this.payMethodForm = this.fb.group({
            id: [''],
            cardName: ['', forms_1.Validators.required],
            ccFirstName: ['', forms_1.Validators.required],
            ccLastName: ['', forms_1.Validators.required],
            ccType: ['', forms_1.Validators.required],
            ccNumber: ['', [forms_1.Validators.required, customValidators_1.CustomValidators.creditCardValidator]],
            ccExpiryMonth: [this.month, forms_1.Validators.required],
            ccExpiryYear: [this.year, [forms_1.Validators.required, customValidators_1.CustomValidators.creditCardYearValidator]],
            ccSecurityCode: ['', [forms_1.Validators.required, customValidators_1.CustomValidators.creditCardSecurityCodeValidator]],
            co: [''],
            street1: ['', forms_1.Validators.required],
            street2: [''],
            city: ['', forms_1.Validators.required],
            state: ['', forms_1.Validators.required],
            zip: ['', forms_1.Validators.required],
            countryName: ['', forms_1.Validators.required],
            isoCode: [''],
            phone: ['', [forms_1.Validators.required, customValidators_1.CustomValidators.phoneValidator]],
            isDefault: [false]
        });
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
    };
    ;
    PaymentMethodForm.prototype.getNewCardFromForm = function () {
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
    PaymentMethodForm.prototype.cancel = function () {
        this.appService.request('close:pay:method:modal')();
    };
    ;
    PaymentMethodForm.prototype.select = function () {
        this.getNewCardFromForm();
        this.appService.emit('select:new:card', this.newCard);
    };
    ;
    PaymentMethodForm.prototype.ngOnDestroy = function () {
        this.dataReadySubs.unsubscribe();
        this.getDefaultBillingAddressSub.unsubscribe();
    };
    ;
    return PaymentMethodForm;
}());
__decorate([
    core_1.Input('newCard'),
    __metadata("design:type", Object)
], PaymentMethodForm.prototype, "newCard", void 0);
PaymentMethodForm = __decorate([
    core_1.Component({
        selector: 'paymentMethodForm',
        templateUrl: 'app/components/paymentMethodForm/paymentMethodForm.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService, forms_1.FormBuilder, api_1.ConfirmationService])
], PaymentMethodForm);
exports.PaymentMethodForm = PaymentMethodForm;
//# sourceMappingURL=paymentMethodForm.component.js.map