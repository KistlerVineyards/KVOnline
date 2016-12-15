import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from '../../services/customValidators';
import { AppService } from '../../services/app.service';
import { md5 } from '../../vendor/md5';
@Component({
    templateUrl: 'app/components/createAccount/createAccount.component.html'
})
export class CreateAccount {
    email: string;
    subscription: Subscription;
    createAccountForm: FormGroup;
    constructor(private appService: AppService, private router: Router, private fb: FormBuilder) {
        this.createAccountForm = fb.group({
            email: ['', [Validators.required, CustomValidators.emailValidator]]
            , password: ['', Validators.required]
            , confirmPassword: ['', Validators.required]
        });
        this.subscription = appService.filterOn('post:create:account')
            .subscribe(d => {
                console.log(d);
                if (d.data.error) {
                    console.log(d.data.error.status)
                    appService.resetCredential();
                } else {
                     this.router.navigate(['/login']);
                }
            });
    };
    createAccount() {
        let pwd = this.createAccountForm.controls["password"].value;
        let confirmPwd = this.createAccountForm.controls["confirmPassword"].value;
        if (pwd === confirmPwd) {
            let data = {
                email: this.createAccountForm.controls["email"].value
                , hash: md5(pwd)
            };
            this.appService.httpPost('post:create:account', data);
        }

    };
    ngOnDestroy() {
        this.subscription.unsubscribe();
    };
}
