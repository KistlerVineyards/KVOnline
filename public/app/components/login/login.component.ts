/*
This software developed by Sushant Agrawal, India, 92/2A Bidhan Nagar Road, Kol 700067, email: capitalch@gmail.com, sagarwal@netwoven.com
*/
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/take';
import { Subscription } from 'rxjs/subscription';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from '../../services/customValidators';
import { AppService } from '../../services/app.service';
import { viewBoxConfig } from '../../config';
import { md5 } from '../../vendor/md5';
import { AlertModule } from 'ng2-bootstrap/components/alert';
import { ControlMessages } from '../controlMessages/controlMessages.component';

@Component({
    templateUrl: 'app/components/login/login.component.html'    
})
export class Login {
    alert: any = {
        show: false,
        type: 'danger',
        message: this.appService.getValidationErrorMessage('loginFailed')
    }
    subscription: Subscription;
    loginFormChangesSubscription: Subscription;
    loginForm: FormGroup;
    constructor(private appService: AppService, private router: Router, private fb: FormBuilder, private activatedRoute: ActivatedRoute) {
        this.loginForm = fb.group({
            email: ['', [Validators.required]]
            , password: ['', Validators.required]
        });        
    };

    authenticate(pwd) {
        if (this.loginForm.valid) {
            let base64Encoded = this.appService.encodeBase64(this.loginForm.controls["email"].value + ':' + md5(pwd));
            console.log('md5:' + md5(pwd));
            console.log(base64Encoded);
            this.appService.httpPost('post:authenticate', { auth: base64Encoded });            
        }
        else {
            this.alert.show = true;
        }
    };

    ngOnInit() {
        this.activatedRoute.queryParams.take(1).subscribe((params: any) => {
            let email = params['email'];
            if (email) {
                this.loginForm.controls["email"].setValue(email);
            }
        });
        this.loginFormChangesSubscription = this.loginForm.valueChanges.take(1).subscribe(x => {
            this.alert.show = false;
        });
	this.subscription = this.appService.filterOn('post:authenticate')
            .subscribe(d => {
                console.log(d);
                if (d.data.error) {
                    console.log(d.data.error.status)
                    this.appService.resetCredential();
                    this.alert.show = true;
                } else {
                    //console.log('token:' + d.data.token);
                    this.alert.show = false;                    
                    this.appService.setCredential(d.data.user, d.data.token, d.data.inactivityTimeoutSecs);
                    //start inactivity timeout using request / reply mecanism
                    this.appService.request('login:success')();
                    this.appService.loadSettings();                    
                    this.router.navigate(['order']);
                }
            });
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
        //this.loginFormChangesSubscription.unsubscribe();
    }
}
