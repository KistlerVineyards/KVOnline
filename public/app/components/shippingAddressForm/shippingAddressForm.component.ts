import {Component, ViewChild, Input} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {AppService} from '../../services/app.service';
import {FormBuilder, Validators, FormControl, FormGroup} from '@angular/forms';
import {CustomValidators} from '../../services/customValidators';
import {Modal, ModalModule} from "ng2-modal"
import {AlertModule} from 'ng2-bootstrap/components/alert';
import {ConfirmDialogModule} from 'primeng/components/confirmdialog/confirmdialog';
import { DialogModule } from 'primeng/components/dialog/dialog';
import {GrowlModule} from 'primeng/components/growl/growl';
import {Message, ConfirmationService} from 'primeng/components/common/api';
import {ControlMessages} from '../controlMessages/controlMessages.component';
//import {TextMaskModule} from 'angular2-text-mask';

@Component({selector: 'shippingAddressForm', templateUrl: 'app/components/shippingAddressForm/shippingAddressForm.component.html'})

export class ShippingAddressForm {
    shippingForm : FormGroup;
    @Input('newAddress')newAddress : any;
    public mask = [
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
    alert : any = {
        show: false,
        type: 'danger',
        message: this
            .appService
            .getValidationErrorMessage('invalidAddress')
    };
    countries : [any];
    isDataReady : boolean = false;
    confirmAddress: boolean;
    unverifiedAddress: boolean;
    addressMessage: string;
    smartyStreeData: any;
    constructor(private appService : AppService, private fb : FormBuilder, private confirmationService : ConfirmationService) {
        this.initShippingForm();
    };

    initShippingForm() {
        this.shippingForm = this
            .fb
            .group({
                id: [''],
                co: [''],
                name: [
                    '', Validators.required
                ],
                street1: [
                    '', Validators.required
                ],
                street2: [''],
                city: [
                    '', Validators.required
                ],
                state: ['', CustomValidators.StateLengthValidator],
                zip: [
                    '', Validators.required
                ],
                countryName: [
                    'United States', Validators.required
                ],
                isoCode: [''],
                phone: [
                    '',
                    [Validators.required, CustomValidators.phoneValidator]
                ],
                isDefault: [false]
            });
        this
            .shippingForm
            .controls['phone']
            .markAsDirty();
    };

    postSubscription : Subscription;
    dataReadySubs : Subscription;
    verifyAddressSub : Subscription;
    initSubscriptions() {
        this.verifyAddressSub = this
            .appService
            .filterOn('get:smartyStreet')
            .subscribe(d => {
                if (d.data.error) {
                    // Authorization of vendor at smartyStreet failed. Maybe purchase of new slot
                    // required
                    this
                        .appService
                        .showAlert(this.alert, true, 'addressValidationUnauthorized');
                    this.isVerifying = false;
                } else {
                    if (d.data.length == 0) {
                        // Verification failed since there is no return
                        this.isVerifying = false;
                        //this.invalidAddressConfirmBeforeSave();
                        this.smartyStreeData = false;
                        this.unverifiedAddress = true;
                    } else {
                        //verification succeeded with maybe corrected address as return
                        let data = d.data[0].components;
                        //this.editedAddressConfirmBeforeSave(data);
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
                        if(this.shippingForm.controls['street2'].value)
                        {
                            street = street.concat('\n', this.shippingForm.controls['street2'].value);
                        }
                        let addr = street.concat("\n", data.city_name, ", ", data.state_abbreviation, ", ", data.zipcode)
                        this.smartyStreeData = data;
                        this.addressMessage = addr;
                        this.confirmAddress = true;
                    }
                }
            });
        this.dataReadySubs = this
            .appService
            .behFilterOn('masters:download:success')
            .subscribe(d => {
                this.countries = this
                    .appService
                    .getCountries();
                this.isDataReady = true;
            });
        this.postSubscription = this
            .appService
            .filterOn("post:shipping:address")
            .subscribe(d => {
                this.isVerifying = false;
                if (d.data.error) {
                    this
                        .appService
                        .showAlert(this.alert, true, 'addressSaveFailed');
                } else {
                    //set iddentity key for address object
                    this.address.id = d.data.result;
                    //pass message to parent window to close this modal
                    this
                        .appService
                        .emit('close:new:address:modal', {
                            success: true,
                            address: this.address
                        });
                }
            });
    };

    invalidAddressConfirmBeforeSave() {
        this
            .confirmationService
            .confirm({
                message: this
                    .appService
                    .getMessage('mess:confirm:save:invalid:address'),
                accept: () => {
                    this.submit(false);
                }
            });
    };
    editedAddressConfirmBeforeSave() {
        if(this.smartyStreeData){
            let data = this.smartyStreeData;
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
            
            this.shippingForm.controls["street1"].setValue(street);
            this.shippingForm.controls["city"].setValue(data.city_name);
            this.shippingForm.controls["state"].setValue(data.state_abbreviation);
            this.shippingForm.controls["zip"].setValue(data.zipcode);
            this.appService.showAlert(this.alert, false);
            this.submit(true);                
        }else{
            this.submit(false);
        }
    };
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

    verifyOrSubmit() {
        if (this.shippingForm.controls['countryName'].value == 'United States') {
            this.verify();
        } else {
            this.submit();
        }
    };

    isVerifying : boolean = false;
    verify() {
        let usAddress = {
            street: this.shippingForm.controls["street1"].value,
            street2: this.shippingForm.controls["street2"].value,
            city: this.shippingForm.controls["city"].value,
            state: this.shippingForm.controls["state"].value,
            zipcode: this.shippingForm.controls["zip"].value
        };
        this.isVerifying = true;
        this
            .appService
            .httpGet('get:smartyStreet', {usAddress: usAddress});
    };

    address : any = {};
    submit(isVerified?: boolean) {
        let countryName = this.shippingForm.controls['countryName'].value;
        this.address = {
            id: this.shippingForm.controls['id'].value,
            name: this.shippingForm.controls['name'].value,
            co: this.shippingForm.controls['co'].value,
            street1: this.shippingForm.controls['street1'].value,
            street2: this.shippingForm.controls['street2'].value,
            city: this.shippingForm.controls['city'].value,
            state: this.shippingForm.controls['state'].value ? this.shippingForm.controls['state'].value :'',
            zip: this.shippingForm.controls['zip'].value,
            country: countryName,
            isoCode: '',
            phone: this.shippingForm.controls['phone'].value,
            isDefault: this.shippingForm.controls['isDefault'].value,
            isAddressVerified: isVerified || false
        };

        this.address.isoCode = this
            .countries
            .filter(d => d.countryName == countryName)[0]
            .isoCode;

        this
            .appService
            .httpPost('post:shipping:address', {address: this.address});
        //close the dialog
        this.confirmAddress=false;
        this.unverifiedAddress=false;

    };

    cancel() {
        this
            .appService
            .showAlert(this.alert, false);
        this
            .appService
            .emit('close:new:address:modal',{});
    };

    openNewAddressModelSub : Subscription;
    ngOnInit() {
        this.initSubscriptions();
        //to reset the form when modal window opens
        this.openNewAddressModelSub = this
            .appService
            .behFilterOn('open:new:address:modal')
            .subscribe(d => {
                this.initShippingForm();
            });
    };

    ngOnDestroy() {
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

    // test() {     this.showMessage({data: {}}); }
}