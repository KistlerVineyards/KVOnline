import { Component, ViewChild, Input, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AppService } from '../../services/app.service';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from '../../services/customValidators';
import { Modal, ModalModule } from "ng2-modal"
import { AlertModule } from 'ng2-bootstrap/components/alert';
import { ControlMessages } from '../controlMessages/controlMessages.component';
import { Message, ConfirmationService } from 'primeng/components/common/api';
import { InputMaskModule } from 'primeng/components/inputMask/inputMask';
import { GrowlModule } from 'primeng/components/growl/growl';
import { ConfirmDialogModule } from 'primeng/components/confirmdialog/confirmdialog';

@Component({
    templateUrl: 'app/components/shippingAddress/shippingAddress.component.html'
})
export class ShippingAddress {
    getSubscription: Subscription;
    postSubscription: Subscription;
    putSubscription: Subscription;
    dataReadySubs: Subscription;
    verifyAddressSub: Subscription;
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
    isVerifying = false;
    radioIndex:number;
    // selectedRadio:any;
    // myRadio:any;
    //@ViewChild('selectedRadio') selectedRadio:any
    @ViewChild('shippingModal') shippingModal: Modal;
    addresses: [any];
    constructor(private appService: AppService, private fb: FormBuilder, private confirmationService: ConfirmationService) {
        this.initShippingForm({});
        this.verifyAddressSub = this.appService.filterOn('get:smartyStreet').subscribe(d => {            
            if (d.data.error) {
                //Authorization of vendor at smartyStreet failed. Maybe purchase of new slot required
                appService.showAlert(this.alert, true, 'addressValidationUnauthorized');
                this.isVerifying = false;
            } else {
                if (d.data.length == 0) {
                    // Verification failed since there is no return
                    this.isVerifying = false;
                    this.invalidAddressConfirmBeforeSave();
                } else {
                    //verification succeeded with maybe corrected address as return
                    let data = d.data[0].components;
                    this.editedAddressConfirmBeforeSave(data);
                }
            }
        });
        this.dataReadySubs=appService.behFilterOn('masters:download:success').subscribe(d=>{
            this.countries = this.appService.getCountries();
            this.isDataReady=true;
        });
        this.getSubscription = appService.filterOn("get:shipping:address")
            .subscribe(d => {
                this.isVerifying = false;
                this.addresses = JSON.parse(d.data).Table;
		this.addresses[this.radioIndex || 0].isSelected = true;
                console.log(d);
            });
        this.postSubscription = appService.filterOn("post:shipping:address")
            .subscribe(d => {
                this.showMessage(d);
            });
        this.putSubscription = appService.filterOn("put:shipping:address")
            .subscribe(d => {
                this.showMessage(d);
            });
    };

    showMessage(d) {
        this.isVerifying = false;
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
            this.shippingModal.close();
        }
    }

    initShippingForm(address) {
        this.shippingForm = this.fb.group({
            id: [address.shippid || ''],
            co: [address.co || ''],
            name: [address.name || '', Validators.required],
            street1: [address.street1 || '', Validators.required],
            street2: [address.street2 || ''],
            city: [address.city || '', Validators.required],
            state: [address.state || ''],
            zip: [address.zip || '', Validators.required],
            countryName: [address.country || '', Validators.required],
            isoCode: [address.isoCode || ''],
            phone: [address.phone || '', [Validators.required, CustomValidators.phoneValidator]],
            isDefault: [address.isDefault || false]
        });
        this.selectedCountryName = address.country;
    };
    ngOnInit() {        
        this.appService.httpGet('get:shipping:address');
    };
    edit(address) {
        this.selectedISOCode = address.isoCode;
        this.initShippingForm(address);
        
        this.shippingModal.open();
    };
    delete(address) {
        if (confirm('Are you sure to delete this address')) {
            console.log('true');
        } else {
            console.log(false);
        }
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
            isDefault: this.shippingForm.controls['isDefault'].value,
            isAddressVerified: isVerified || false
        };
        addr.isoCode = this.countries.filter(d => d.countryName == this.selectedCountryName)[0].isoCode;
        if (addr.id) {
            this.appService.httpPut('put:shipping:address', { address: addr });
        } else {
            this.appService.httpPost('post:shipping:address', { address: addr });
        }
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

    editedAddressConfirmBeforeSave(data) {
        let street = (data.street_predirection || '').concat(' ', data.primary_number || '', ' ', data.street_name || '', ' ', data.street_suffix || '', ' ', data.street_postdirection || '');
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
    };

    ngOnDestroy() {
        this.getSubscription.unsubscribe();
        this.postSubscription.unsubscribe();
        this.putSubscription.unsubscribe();
        this.dataReadySubs.unsubscribe();
        this.verifyAddressSub.unsubscribe();
    };
}