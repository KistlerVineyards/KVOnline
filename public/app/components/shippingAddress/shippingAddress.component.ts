import { Component, ViewChild, Input, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AppService } from '../../services/app.service';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from '../../services/customValidators';
import { Modal, ModalModule } from "ng2-modal"
import { AlertModule } from 'ng2-bootstrap/components/alert';
import { ControlMessages } from '../controlMessages/controlMessages.component';
import { Message, ConfirmationService } from 'primeng/components/common/api';
// import { InputMaskModule } from 'primeng/components/inputMask/inputMask';
import { GrowlModule } from 'primeng/components/growl/growl';
import { ConfirmDialogModule } from 'primeng/components/confirmdialog/confirmdialog';
import { DialogModule } from 'primeng/components/dialog/dialog';
//import { TextMaskModule } from 'angular2-text-mask';
@Component({
    templateUrl: 'app/components/shippingAddress/shippingAddress.component.html'
})
export class ShippingAddress {
    getSubscription: Subscription;
    postSubscription: Subscription;
    putSubscription: Subscription;
    dataReadySubs: Subscription;
    verifyAddressSub: Subscription;
    postDeleteSubscription: Subscription;
    shippingForm: FormGroup;
    alert: any = {
        show: false,
        type: 'danger',
        message: this.appService.getValidationErrorMessage('invalidAddress')
    };
    countries: [any];
    selectedISOCode: string = '';
    selectedCountryName: string = 'United States';
    selectedCountryObj: any = {};
    isDataReady:boolean=false;
    messages: Message[] = [];
    isVerifying = false;
    radioIndex: number;
    @ViewChild('shippingModal') shippingModal: Modal;
    addresses: [any];
    confirmAddress: boolean;
    unverifiedAddress: boolean;
    addressMessage: string;
    smartyStreeData: any;
    //public mask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
    
    constructor(private appService: AppService, private fb: FormBuilder, private confirmationService: ConfirmationService) {
        this.initShippingForm({});
    };
    initSubscriptions() {
        this.verifyAddressSub = this.appService.filterOn('get:smartyStreet').subscribe(d => {            
            if (d.data.error) {
                //Authorization of vendor at smartyStreet failed. Maybe purchase of new slot required
                this.appService.showAlert(this.alert, true, 'addressValidationUnauthorized');
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
                    //street = street.concat('\n', this.shippingForm.controls['street2'].value);
                    let addr = street.concat("\n", data.city_name, ", ", data.state_abbreviation, ", ", data.zipcode)
                    this.smartyStreeData = data;
                    this.addressMessage = addr;
                    this.confirmAddress = true;
                }
            }
        });
        this.dataReadySubs=this.appService.behFilterOn('masters:download:success').subscribe(d=>{
            this.countries = this.appService.getCountries();
            this.isDataReady=true;
        });
        this.getSubscription = this.appService.filterOn("get:shipping:address")
            .subscribe(d => {
                this.isVerifying = false;
                this.addresses = JSON.parse(d.data).Table;
                if (this.addresses.length > 0) {
                    if (this.radioIndex > (this.addresses.length-1)) {
                        this.radioIndex = this.addresses.length-1;
                    }
                    this.addresses[this.radioIndex || 0].isSelected = true;
                    this.addresses = JSON.parse(d.data).Table.map(function (value, i) {
                    if(!value.country)
                    {
                        value.country ="United States";
                    }
                    return (value);
                    });                
                }
            });
        this.postSubscription = this.appService.filterOn("post:shipping:address")
            .subscribe(d => {
                this.showMessage(d);
            });
        this.putSubscription = this.appService.filterOn("put:shipping:address")
            .subscribe(d => {
                this.showMessage(d);
            });
        this.postDeleteSubscription = this.appService.filterOn("post:delete:shipping:address")
            .subscribe(d => {
                if (d.data.error) {
                    console.log(d.data.error);
                    // this.appService.doGrowl(this.messages, 'error', 'Error', 'Deletion of address failed at server')
                    this.messages = [];
                    this.messages.push({
                        severity: 'error'
                        , summary: 'Error'
                        , detail: 'Address could not be deleted'
                    });
                } else {
                    this.appService.httpGet('get:shipping:address');
                    this.messages = [];
                    this.messages.push({
                        severity: 'success'
                        , summary: 'Success'
                        , detail: 'Data saved successfully'
                    });

                }
            });
    };

    confirmRemove(address) {
        this.confirmationService.confirm({
            message: 'Are you sure to delete this address?',
            accept: () => {
                this.appService.httpPost('post:delete:shipping:address', { sqlKey: 'DeleteShippingAddress', sqlParms: { id: address.shippid } });
            }
        });
    };

    showMessage(d) {
        this.isVerifying = false;
        if (d.data.error) {
            this.appService.showAlert(this.alert, true, 'addressSaveFailed');
        } else {
            this.appService.showAlert(this.alert, false);
            this.appService.httpGet('get:shipping:address');
            this.initShippingForm({});
            this.messages = [];
            this.messages.push({
                severity: 'success'
                , summary: 'Saved'
                , detail: 'Data saved successfully'
            });
            // this.appService.doGrowl(this.messages, 'success', 'Saved', 'Data saved successfully');            
            this.shippingModal.close();
        }
    };

    initShippingForm(address) {
        if(this.isDataReady){
            try{
                let userselectedCountry = this.countries.filter(d => d.countryName == address.country);
                if(userselectedCountry.length == 0){
                    address.country ="United States";
                    address.isoCode ="US";
                }
            }
            catch(ex){
                address.country ="United States";
                address.isoCode ="US";
            }
        }
        this.shippingForm = this.fb.group({
            id: [address.shippid || ''],
            co: [address.co || ''],
            name: [address.name || '', Validators.required],
            street1: [address.street1 || '', Validators.required],
            street2: [address.street2 || ''],
            city: [address.city || '', Validators.required],
            state: [address.state || '', CustomValidators.StateLengthValidator],
            zip: [address.zip || '', Validators.required],
            countryName: [address.country || '', Validators.required],
            isoCode: [address.isoCode || ''],
            phone: [address.phone || '', [Validators.required, CustomValidators.phoneValidator]],
            isDefault: [address.isDefault || false]
        });
        this.shippingForm.controls['phone'].markAsDirty();
        this.selectedCountryName = address.country;
        
        if(!address.phone){
            //separate reset is required to clear the input mask control
            this.shippingForm.controls['phone'].reset();
        }        
    };
    ngOnInit() {        
	this.initSubscriptions();
        this.appService.httpGet('get:shipping:address');
    };
    edit(address) {
        
        this.selectedISOCode = address.isoCode;
        this.initShippingForm(address);
        
        this.shippingModal.open();
    };

    verifyOrSubmit() {
        if (this.selectedCountryName == 'United States') {
            this.verify();
        } else {
            this.submit();
        }
    };

    verify() {
        let usAddress = {
            street: this.shippingForm.controls["street1"].value,
            street2: this.shippingForm.controls["street2"].value,
            city: this.shippingForm.controls["city"].value,
            state: this.shippingForm.controls["state"].value,
            zipcode: this.shippingForm.controls["zip"].value
        };
        this.isVerifying = true;
        this.appService.httpGet('get:smartyStreet', { usAddress: usAddress });

    };

    submit(isVerified?: boolean) {
        try{
            let userselectedCountry = this.countries.filter(d => d.countryName == this.selectedCountryName);
            if(userselectedCountry.length == 0){
                this.selectedCountryName ="United States";
            }
        }
        catch(ex){
                this.selectedCountryName ="United States";
        }
        let addr = {
            id: this.shippingForm.controls['id'].value,
            name: this.shippingForm.controls['name'].value,
            co: this.shippingForm.controls['co'].value ? this.shippingForm.controls['co'].value : '',
            street1: this.shippingForm.controls['street1'].value,
            street2: this.shippingForm.controls['street2'].value ? this.shippingForm.controls['street2'].value : '',
            city: this.shippingForm.controls['city'].value,
            state: this.shippingForm.controls['state'].value ? this.shippingForm.controls['state'].value :'',
            zip: this.shippingForm.controls['zip'].value,
            country: this.selectedCountryName,
            isoCode: '',
            phone: this.shippingForm.controls['phone'].value,
            isDefault: this.shippingForm.controls['isDefault'].value,
            isAddressVerified: isVerified || false
        };
        addr.isoCode = this.countries.filter(d => d.countryName == this.selectedCountryName)[0].isoCode;
        if (addr.id) {
            this.appService.httpPut('put:shipping:address', { address: addr });
        } else {
            this.appService.httpPost('post:shipping:address', { address: addr });
        }
        //close the dialog
        this.confirmAddress=false;
        this.unverifiedAddress=false;

    };
    addAddress() {
        this.initShippingForm({ country: 'United States' });
        this.shippingModal.open();
    };
    cancel() {
        this.appService.showAlert(this.alert, false);
        this.shippingModal.close();
    };
    
    click(radioButton,index){
        radioButton.checked=true;
        this.radioIndex = index;
    };

    invalidAddressConfirmBeforeSave() {
        this.confirmationService.confirm({
            message: this.appService.getMessage('mess:confirm:save:invalid:address'),
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

    ngOnDestroy() {
        this.getSubscription.unsubscribe();
        this.postSubscription.unsubscribe();
        this.putSubscription.unsubscribe();
        this.dataReadySubs.unsubscribe();
        this.verifyAddressSub.unsubscribe();
    };
}