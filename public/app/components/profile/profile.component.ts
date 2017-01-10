import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { FormBuilder, Validators, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomValidators } from '../../services/customValidators';
import { AppService } from '../../services/app.service';
import { AlertModule } from 'ng2-bootstrap/components/alert';
import { ControlMessages } from '../controlMessages/controlMessages.component';
import { CalendarModule } from 'primeng/components/calendar/calendar';
// import { InputMaskModule } from 'primeng/components/inputMask/inputMask';
import { GrowlModule } from 'primeng/components/growl/growl';
import { Util } from '../../services/util';
import { TextMaskModule } from 'angular2-text-mask';
import { Message, ConfirmationService } from 'primeng/components/common/api';
import { ConfirmDialogModule } from 'primeng/components/confirmdialog/confirmdialog';


@Component({
    templateUrl: 'app/components/profile/profile.component.html'
})
export class Profile {
    getProfileSubscription: Subscription;
    saveProfileSubscription: Subscription;
    // smartyStreetSubscription: Subscription;
    dataReadySubs: Subscription;
    profileForm: FormGroup;
    profile: any = {};
    primeDate: any;
    countries: [any];
    selectedCountryName: string = 'United States';
    alert: any = {
        show: false,
        type: 'danger',
        message: this.appService.getValidationErrorMessage('invalidAddress')
    };
    messages: Message[] = [];
    isDataReady: boolean = false;
    user: any = {};
    public mask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

    verifyAddressSub: Subscription;
    constructor(private appService: AppService, private fb: FormBuilder, private confirmationService: ConfirmationService) {
        this.user = appService.getCredential().user;
        this.initProfileForm();
	this.dataReadySubs = appService.behFilterOn('masters:download:success').subscribe(d => {
            this.countries = this.appService.getCountries();
            this.isDataReady = true;
        });
        this.getProfileSubscription = appService.filterOn('get:user:profile')
            .subscribe(d => {
                if (d.data.error) {
                    console.log(d.data.error);
                } else {
                    let profileArray = JSON.parse(d.data).Table;
                    if (profileArray.length > 0) {
                        this.profile = profileArray[0];
                    }
                    this.initProfileForm();
                }
            });
        this.verifyAddressSub = this.appService.filterOn('get:smartyStreet').subscribe(d => {
            if (d.data.error) {
                //Authorization of vendor at smartyStreet failed. Maybe purchase of new slot required
                this.appService.showAlert(this.alert, true, 'addressValidationUnauthorized');
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

        this.saveProfileSubscription = appService.filterOn('post:save:profile')
            .subscribe(d => {
                if (d.data.error) {
                    this.appService.showAlert(this.alert, true, 'dataNotSaved');
                } else {
                    this.appService.showAlert(this.alert,false);
                    this.messages = [];
                    this.messages.push({
                        severity: 'success'
                        , summary: 'Saved'
                        , detail: 'Data saved successfully'
                    });
                    this.appService.httpGet('get:user:profile');
                }
            });
    };

    invalidAddressConfirmBeforeSave() {
        this.confirmationService.confirm({
            message: this.appService.getMessage('mess:confirm:save:invalid:address')
            , accept: () => {
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
                this.profileForm.controls["mailingAddress1"].setValue(street);
                this.profileForm.controls["mailingCity"].setValue(data.city_name);
                this.profileForm.controls["mailingState"].setValue(data.state_abbreviation);
                this.profileForm.controls["mailingZip"].setValue(data.zipcode);
                this.appService.showAlert(this.alert, false);
                this.submit(true);
            }
        });
    };

    ngOnInit() {
        this.appService.httpGet('get:user:profile');
    };

    initProfileForm() {
        let mDate = Util.convertToUSDate(this.profile.birthDay);
        this.profileForm = this.fb.group({
            id: [this.profile.id],
            firstName: [this.profile.firstName, Validators.required]
            //, lastName: [this.profile.lastName, Validators.required]
	        , co:[this.profile.co]
            , phone: [this.profile.phone, [Validators.required, CustomValidators.phoneValidator]]
            , birthDay: [mDate, Validators.required]
            , mailingAddress1: [this.profile.mailingAddress1, Validators.required]
            , mailingAddress2: [this.profile.mailingAddress2]
            , mailingCity: [this.profile.mailingCity, Validators.required]
            , mailingState: [this.profile.mailingState, Validators.required]
            , mailingZip: [this.profile.mailingZip, Validators.required]
	    , mailingCountry: [this.profile.mailingCountry, Validators.required]
        });
        if (!this.profile.mailingCountry) {
            this.profileForm.controls['mailingCountry'].setValue('United States');
        }
        this.profileForm.controls['phone'].markAsDirty();
        this.profileForm.markAsPristine();
    };
    getUpdatedProfile() {
        let mDate = Util.getISODate(this.profileForm.controls['birthDay'].value);
        let pr: any = {};
        pr.id = this.profile.id;
        pr.firstName = this.profileForm.controls['firstName'].value;
        //pr.lastName = this.profileForm.controls['lastName'].value;
	    pr.co=this.profileForm.controls['co'].value;
        pr.co = pr.co ? pr.co :'';
        pr.phone = this.profileForm.controls['phone'].value;
        pr.birthDay = mDate;
        pr.mailingAddress1 = this.profileForm.controls['mailingAddress1'].value;
	    pr.mailingAddress2 = this.profileForm.controls['mailingAddress2'].value;
        pr.mailingAddress2 = pr.mailingAddress2 ? pr.mailingAddress2 :'';
        pr.mailingCity = this.profileForm.controls['mailingCity'].value;
        pr.mailingState = this.profileForm.controls['mailingState'].value;
        pr.mailingZip = this.profileForm.controls['mailingZip'].value;
	    pr.mailingCountry = this.profileForm.controls['mailingCountry'].value;// this.profileForm.controls['mailingCountry'].value;
        pr.mailingCountryisoCode = this.countries.filter(d => d.countryName == pr.mailingCountry)[0].isoCode;
        return (pr);
    };

    verifyOrSubmit() {
        this.appService.showAlert(this.alert,false);
        let profile = this.getUpdatedProfile();
        if (profile.mailingCountry == 'United States') {
            this.verify();
        } else {
            this.submit();
        }
    };

    isVerifying: boolean = false;
    verify() {
        let usAddress = {
            street: this.profileForm.controls["mailingAddress1"].value,
            street2: this.profileForm.controls["mailingAddress2"].value,
            city: this.profileForm.controls["mailingCity"].value,
            state: this.profileForm.controls["mailingState"].value,
            zipcode: this.profileForm.controls["mailingZip"].value
        };
        this.isVerifying = true;
        this.appService.httpGet('get:smartyStreet', { usAddress: usAddress });
    };

    submit(isVerified?: boolean) {
        let profile = this.getUpdatedProfile();
        profile.isAddressVerified = isVerified || false;
        this.appService.httpPost('post:save:profile', { profile: profile });
    };

    ngOnDestroy() {
        this.getProfileSubscription.unsubscribe();
        this.saveProfileSubscription.unsubscribe();
        this.verifyAddressSub.unsubscribe();
        this.dataReadySubs.unsubscribe();
    };
}