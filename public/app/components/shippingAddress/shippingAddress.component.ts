import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AppService } from '../../services/app.service';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from '../../services/customValidators';
import { Modal, ModalModule } from "ng2-modal"
import { AlertModule } from 'ng2-bootstrap/components/alert';
import {InputMaskModule, GrowlModule, Message } from 'primeng/primeng';
import { ControlMessages } from '../controlMessages/controlMessages.component';
@Component({
    templateUrl: 'app/components/shippingAddress/shippingAddress.component.html'
})
export class ShippingAddress {
    getSubscription: Subscription;
    postSubscription: Subscription;
    putSubscription: Subscription;
    dataReadySubs:Subscription;
    validateAddressSub: Subscription;
    shippingForm: FormGroup;
    alert: any = {
        show: false,
        type: 'danger',
        message: this.appService.getValidationErrorMessage('invalidAddress')
    };
    countries: [any];
    selectedISOCode: string = '';
    selectedCountryName: string = '';
    selectedCountryObj: any = {};
    isDataReady:boolean=false;
    messages: Message[] = [];
    isSaving=false;
    @ViewChild('shippingModal') shippingModal: Modal;
    addresses: [{}];
    constructor(private appService: AppService, private fb: FormBuilder) {
        this.initShippingForm({});
        this.validateAddressSub = this.appService.filterOn('get:smartyStreet').subscribe(d => {
            if (d.data.error) {
                appService.showAlert(this.alert, true, 'addressValidationUnauthorized');
                this.isSaving=false;
            } else {
                if (d.data.length == 0) {
                    appService.showAlert(this.alert, true, 'invalidAddress');
                    this.isSaving=false;
                } else {
                    let data = d.data[0].components;
                    let street = (data.street_predirection || '').concat(' ', data.primary_number, ' ', data.street_name, ' ', data.street_suffix);//, ' ', data.street_postdirection);
                    if(data.street_postdirection){
                        street = street.concat(' ', data.street_postdirection);
                    }
                    this.shippingForm.controls["street1"].setValue(street);
                    this.shippingForm.controls["city"].setValue(data.city_name);
                    this.shippingForm.controls["state"].setValue(data.state_abbreviation);
                    this.shippingForm.controls["zip"].setValue(data.zipcode);
                    this.appService.showAlert(this.alert, false);
                    this.submit();
                }
            }
        });
        this.dataReadySubs=appService.behFilterOn('masters:download:success').subscribe(d=>{
            this.countries = this.appService.getCountries();
            this.isDataReady=true;
        });
        this.getSubscription = appService.filterOn("get:shipping:address")
            .subscribe(d => {
                this.isSaving=false;
                this.addresses = JSON.parse(d.data).Table;
                console.log(d);
            });
        this.postSubscription = appService.filterOn("post:shipping:address")
            .subscribe(d => {
                this.isSaving=false;
                if (d.data.error) {
                    this.appService.showAlert(this.alert, true, 'addressSaveFailed');
                } else {
                    this.appService.httpGet('get:shipping:address');
                    this.initShippingForm({});
                    //this.appService.showAlert(this.alert, false);
                    this.messages = [];
                    this.messages.push({
                        severity: 'success'
                        , summary: 'Saved'
                        , detail: 'Data saved successfully'
                    });
                    this.shippingModal.close();
                }
            });
        this.putSubscription = appService.filterOn("put:shipping:address")
            .subscribe(d => {
                this.isSaving=false;
                if (d.data.error) {
                    this.appService.showAlert(this.alert, true, 'addressSaveFailed');
                } else {
                    this.appService.httpGet('get:shipping:address');
                    this.initShippingForm({});
                    this.messages = [];
                    this.messages.push({
                        severity: 'success'
                        , summary: 'Saved'
                        , detail: 'Data saved successfully'
                    });
                    //this.appService.showAlert(this.alert, false);
                    this.shippingModal.close();
                }
            });
    };
    initShippingForm(address) {
        this.shippingForm = this.fb.group({
            id: [address.shippid || ''],
            co: [address.co || ''],
            name: [address.name || '', Validators.required],
            street1: [address.street1 || '', Validators.required],
            street2: [address.street2 || ''],
            city: [address.city || '', Validators.required],
            state: [address.state || ''],
            zip: [address.zip || '', [Validators.required, CustomValidators.usZipCodeValidator]],
            countryName: [address.country || '', Validators.required],
            isoCode: [address.isoCode || ''],
            phone: [address.phone || '', [Validators.required, CustomValidators.phoneValidator]],
            isDefault: [address.isDefault || false]
        }
            // , {
            //     asyncValidator: this.validateUSAddressAsync.bind(this)
            // }
        );
        this.selectedCountryName = address.country;
    };
    ngOnInit() {        
        this.appService.httpGet('get:shipping:address');
    };
    edit(address) {
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
    delete(address) {
        if (confirm('Are you sure to delete this address')) {
            console.log('true');
        } else {
            console.log(false);
        }
    };
    submitting() {
        if(this.selectedCountryName == "United States"){
            this.verifybysmartyStreet();
        }
        else{
            this.submit();
        }
    };
    verifybysmartyStreet(){
        let usAddress = {
            street: this.shippingForm.controls["street1"].value,
            street2: this.shippingForm.controls["street2"].value,
            city: this.shippingForm.controls["city"].value,
            state: this.shippingForm.controls["state"].value,
            zipcode: this.shippingForm.controls["zip"].value
        };
        this.isSaving=true;
        this.appService.httpGet('get:smartyStreet', { usAddress: usAddress });

    };
    submit() {
        let addr = {
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
        addr.isoCode = this.countries.filter(d => d.countryName == this.selectedCountryName)[0].isoCode;
        //addr.country = this.countries.filter(d => d.isoCode == this.selectedISOCode)[0].countryName;
        if (addr.id) {
            this.appService.httpPut('put:shipping:address', { address: addr });
        } else {
            this.appService.httpPost('post:shipping:address', { address: addr });
        }
    };
    addAddress() {
        let addr = {
           country : this.countries.filter(d => d.isoCode == "US")[0].countryName,
           isoCode : "US",
        };
        this.initShippingForm(addr);
        this.shippingModal.open();
    };
    cancel() {
        this.appService.showAlert(this.alert, false);
        this.shippingModal.close();
    };
    ngOnDestroy() {
        this.getSubscription.unsubscribe();
        this.postSubscription.unsubscribe();
        this.putSubscription.unsubscribe();
        this.dataReadySubs.unsubscribe();
        this.validateAddressSub.unsubscribe();
    };
}