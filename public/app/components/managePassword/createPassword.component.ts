import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from '../../services/customValidators';
import { Subscription } from 'rxjs/Subscription';
import { AppService } from '../../services/app.service';
import { AlertModule } from 'ng2-bootstrap/components/alert';
import { ControlMessages } from '../controlMessages/controlMessages.component';
import { md5 } from '../../vendor/md5';

@Component({
    templateUrl: 'app/components/managePassword/createPassword.component.html'
})
export class CreatePassword {
    createPasswordSubs: Subscription
    alert: any = {};
    createPwdForm: FormGroup;
    constructor(private appService: AppService, private router: Router, private fb: FormBuilder) {
        this.createPasswordSubs = appService.filterOn('post:create:password')
            .subscribe(d => {
                if (d.data.error) {
                    console.log(d.data.error.status);
                    this.appService.showAlert(this.alert, true, 'createPasswordFailed')
                } else {
                    this.appService.resetCredential();
                    this.appService.showAlert(this.alert, false);
                    this.router.navigate(['/login']);
                }
            });
    };
    checkFormGroup(group) {
        let ret = null;
        if (group.dirty) {
            if (group.value.newPassword1 != group.value.newPassword2) {
                ret = { 'confirmPasswordMismatch': true }
            }
        }
        return (ret);
    };
    ngOnInit() {
        this.createPwdForm = this.fb.group({
            newPassword1: ['', Validators.required],
            newPassword2: ['', Validators.required]
        }, { validator: this.checkFormGroup });
    };
    createPassword(newPwd1, newPwd2) {
        if (newPwd1 === newPwd2) {
            let code = window.location.search.split('=')[1];
            let base64Encoded = this.appService.encodeBase64(md5(newPwd1));
            // console.log(base64Encoded);
            this.appService.httpPost('post:create:password', { auth: code,encodedHash:base64Encoded });
        } else {
            this.appService.showAlert(this.alert, true, 'confirmPasswordMismatch', 'danger');
        }
    }
    ngOnDestroy() {
        this.createPasswordSubs.unsubscribe();
    }
}