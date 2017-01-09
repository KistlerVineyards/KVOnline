import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
    newUserSub: Subscription;
    newUserText:string='';
    createAccountForm: FormGroup;
    allowCreateNewUser: boolean = false;
    constructor(private appService: AppService, private router: Router, private fb: FormBuilder, private activatedRoute: ActivatedRoute) {
        this.createAccountForm = fb.group({
            code: ['']
            , password: ['', [Validators.required, CustomValidators.pwdComplexityValidator]]
            , confirmPassword: ['', [Validators.required, CustomValidators.pwdComplexityValidator]]
        });

        this.subscription = appService.filterOn('post:create:account')
            .subscribe(d => {
                console.log(d);
                if (d.data.error) {
                    console.log(d.data.error.status)
                    appService.resetCredential();
                } else {
                    // this.alert.show = false;
                    this.appService.setCredential(d.data.user, d.data.token, d.data.inactivityTimeoutSecs);
                    //start inactivity timeout using request / reply mecanism
                    this.appService.request('login:success')();
                    this.appService.loadSettings();
                    this.router.navigate(['order']);
                }
            });

        this.newUserSub = appService.filterOn('post:new:user:login')
            .subscribe(d => {
                if (d.data.error) {
                    this.router.navigate(['/login']);
                } else {
                    let res = d.data.result.split('#;')
                    let toLogin,newUserText;
                    if(res.length === 2){
                        toLogin=res[0];
                        newUserText=res[1];
                    }
                    if (toLogin === 'login') {
                        this.router.navigate(['/login']);
                    } else if (toLogin === 'newUser') {
                        this.allowCreateNewUser = true;
                        this.newUserText = newUserText;
                    } else {
                        this.router.navigate(['/login']);
                    }
                }
            });
    };

    createAccount() {
        let pwd = this.createAccountForm.controls["password"].value;
        let confirmPwd = this.createAccountForm.controls["confirmPassword"].value;
        if (pwd === confirmPwd) {
            let code = this.createAccountForm.controls["code"].value;
            let hash=md5(pwd);            
            let auth = this.appService.encodeBase64(code+":"+hash);
            this.appService.httpPost('post:create:account',{auth:auth});
        }
    };
    code: string;
    offerId: string;
    querySub: Subscription;
    ngOnInit() {
        this.querySub = this.activatedRoute.queryParams.take(1).subscribe((params: any) => {
            this.code = params['code'];
            this.offerId = params['offerId']
            if (this.code) {
                this.createAccountForm.controls['code'].setValue(this.code);
            }
        });
        let auth = this.appService.encodeBase64(this.code + ':' + this.offerId);
        this.appService.httpPost('post:new:user:login', { auth: auth });        
    };

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.querySub.unsubscribe();
        this.newUserSub.unsubscribe();
    };
}
