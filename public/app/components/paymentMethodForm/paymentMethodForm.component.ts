import { Component, ViewChild, Input } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AppService } from '../../services/app.service';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from '../../services/customValidators';
import { Util } from '../../services/util';
import { Modal, ModalModule } from "ng2-modal"
import { AlertModule } from 'ng2-bootstrap/components/alert';
import { ConfirmDialogModule } from 'primeng/components/confirmdialog/confirmdialog';
import { GrowlModule } from 'primeng/components/growl/growl';
import { Message, ConfirmationService } from 'primeng/components/common/api';
// import { InputMaskModule } from 'primeng/components/inputMask/inputMask';
import { ControlMessages } from '../controlMessages/controlMessages.component';
//import { TextMaskModule } from 'angular2-text-mask';
@Component({
    selector: 'paymentMethodForm'
    , templateUrl: 'app/components/paymentMethodForm/paymentMethodForm.component.html'
})
export class PaymentMethodForm {
    @Input('newCard') newCard: any;
    dataReadySubs: Subscription;
    // @ViewChild('payMethodModal') payMethodModal: Modal;
    payMethodForm: FormGroup;
    postPayMethodSub: Subscription;
    alert: any = {};
    year: number;
    month: number;
    countries: [any];
    creditCardTypes: any = [];
    isDataReady: boolean = false;
    selectedISOCode: string = '';
    selectedCreditCardType = '';
    //public mask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
    //public ccmask = [/[1-9]/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
    getDefaultBillingAddressSub: Subscription;
    constructor(private appService: AppService, private fb: FormBuilder, private confirmationService: ConfirmationService) {
        // console.log(this.testData);
        this.dataReadySubs = appService.behFilterOn('masters:download:success').subscribe(d => {
            this.countries = this.appService.getCountries();
            this.creditCardTypes = this.appService.getSetting('creditCardTypes');
            this.isDataReady = true;
        });

        this.getDefaultBillingAddressSub = appService.filterOn("get:default:billing:address")
            .subscribe(d => {
                if (d.data.error) {
                    console.log('Error occured fetching default billing address');
                } else {
                    
                    let defaultBillingAddress = JSON.parse(d.data).Table[0] || {};
                    this.payMethodForm.controls['street1'].setValue(defaultBillingAddress.street1);
                    this.payMethodForm.controls['street2'].setValue(defaultBillingAddress.street2);
                    this.payMethodForm.controls['city'].setValue(defaultBillingAddress.city);
                    this.payMethodForm.controls['state'].setValue(defaultBillingAddress.state);
                    this.payMethodForm.controls['zip'].setValue(defaultBillingAddress.zip);                    
                    this.payMethodForm.controls['phone'].setValue(defaultBillingAddress.phone);
                    this.payMethodForm.controls['countryName'].setValue(defaultBillingAddress.isoCode);
                    this.selectedISOCode = defaultBillingAddress.isoCode;
                    
                }
            });
        this.postPayMethodSub = appService.filterOn("post:payment:method")
            .subscribe(d => {
                if (d.data.error) {
                    this.appService.showAlert(this.alert, true, 'payMethodInsertFailed');
                }
                else {
                    this.appService.emit('select:new:card',this.newCard );
                    this.initPayMethodForm();
                }
            });            
    };

    initPayMethodForm() {
        this.year = (new Date()).getFullYear();
        this.month = (new Date()).getMonth() + 1;
        this.payMethodForm = this.fb.group({
            id: ['']
            , cardName: ['', Validators.required]
            , ccFirstName: ['', Validators.required]
            , ccLastName: ['', Validators.required]
            , ccType: ['', Validators.required]
            , ccNumber: ['', [Validators.required, CustomValidators.creditCardValidator]]
            , ccExpiryMonth: [this.month, Validators.required]
            , ccExpiryYear: [this.year, [Validators.required, CustomValidators.creditCardYearValidator]]
            , ccSecurityCode: ['', [Validators.required, CustomValidators.creditCardSecurityCodeValidator]]
            , co: ['']
            , street1: ['', Validators.required]
            , street2: ['']
            , city: ['', Validators.required]
            , state: ['', Validators.required]
            , zip: ['', Validators.required]
            , countryName: ['', Validators.required]
            , isoCode: ['']
            , phone: ['', [Validators.required, CustomValidators.phoneValidator]]
            , isDefault: [false]
            , isSaveForLaterUse: [false]
        }, { validator: CustomValidators.expiryMonthYearValidator });
        this.payMethodForm.controls['phone'].markAsDirty();
        this.payMethodForm.controls['ccType'].markAsDirty();
    };

    getFormFromNewCard() {        
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
    @ViewChild('isSaveForLaterUse') isSaveForLaterUse: any;
    getNewCardFromForm() {
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
    };

    ngOnInit() {
        this.initPayMethodForm();        
        this.payMethodForm.controls["countryName"].setValue("US");
        this.selectedISOCode = "US";
        this.payMethodForm.controls['ccType'].setValue('Visa');
        this.selectedCreditCardType = "Visa";

        if (Object.keys(this.newCard).length > 0){
            this.getFormFromNewCard();
        }
    };

    cancel() {
        this.appService.request('close:pay:method:modal')();
    };

    select() {
        this.getNewCardFromForm();
        if(this.newCard.isSaveForLaterUse){
            this.saveCardForLaterUse();
        }
        else {
            this.appService.emit('select:new:card',this.newCard );
            this.initPayMethodForm();
        }

    };
    saveCardForLaterUse() {
        let firstName = this.payMethodForm.controls['ccFirstName'].value || '';
        let lastName = this.payMethodForm.controls['ccLastName'].value || '';
        let ccNumber = this.payMethodForm.controls['ccNumber'].value.toString();
        //ccNumber = ccNumber.substring(0, ccNumber.length -4).replace(new RegExp("[0-9]", "g"), "X") + ccNumber.substring(ccNumber.length -4, ccNumber.length);
        //ccNumber = ccNumber.toString();
        ccNumber = Util.getMaskedCCNumber(ccNumber);
        //ccNumber = ccNumber + ccNumberactual.slice(-4);
        let payMethod = {
            cardName: this.payMethodForm.controls['cardName'].value
            , ccFirstName: this.payMethodForm.controls['ccFirstName'].value
            , ccLastName: this.payMethodForm.controls['ccLastName'].value
            , ccType: this.payMethodForm.controls['ccType'].value
            , ccNumber: ccNumber
            , encryptedCCNumber: this.payMethodForm.controls['ccNumber'].value
            , ccExpiryMonth: this.payMethodForm.controls['ccExpiryMonth'].value
            , ccExpiryYear: this.payMethodForm.controls['ccExpiryYear'].value
            , ccSecurityCode: this.payMethodForm.controls['ccSecurityCode'].value
            //, co: ['']
            //, name: this.payMethodForm.controls['name'].value
            , name: firstName + ' ' +lastName
            , street1: this.payMethodForm.controls['street1'].value
            , street2: this.payMethodForm.controls['street2'].value ? this.payMethodForm.controls['street2'].value : ''
            , city: this.payMethodForm.controls['city'].value
            , state: this.payMethodForm.controls['state'].value
            , zip: this.payMethodForm.controls['zip'].value
            , country: ''
            , isoCode: ''
            , phone: this.payMethodForm.controls['phone'].value
            , isDefault: this.payMethodForm.controls['isDefault'].value
        };
        payMethod.isoCode = this.selectedISOCode;
        payMethod.country = this.countries.filter(d => d.isoCode == this.selectedISOCode)[0].countryName;
        this.appService.httpPost('post:payment:method', { sqlKey: 'InsertPaymentMethod', sqlParms: payMethod });
    };
    ngOnDestroy() {
        this.dataReadySubs.unsubscribe();
        this.getDefaultBillingAddressSub.unsubscribe();
        this.postPayMethodSub.unsubscribe();
    };
}