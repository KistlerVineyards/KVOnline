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
  templateUrl: 'app/components/managePassword/forgotPassword.component.html'
})
export class ForgotPassword {
  subscription: Subscription;
  //email: string;
  forgotForm: FormGroup;
  alert: any = {};
  constructor(private appService: AppService, private router: Router, private fb: FormBuilder) {
    this.subscription = appService.filterOn('post:forgot:password')
      .subscribe(d => {
        if (d.data.error) {
          console.log(d.data.error.status);
          this.appService.showAlert(this.alert, true, 'emailNotFound');
        } else {
          console.log('Success');
          
          //this.appService.showAlert(this.alert, true, 'emailFound');
          this.router.navigate(['/login']);
        }
      });
  };
  ngOnInit() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, CustomValidators.emailValidator]]
    });
  }
  sendMail(email) {
    this.alert = {};
    let base64Encoded = this.appService.encodeBase64(email);
    this.appService.httpPost('post:forgot:password', { auth: base64Encoded });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

//send password component
@Component({
  template: `
  <button (click)="sendPassword()">Send Password</button>
  `
})
export class SendPassword {
  subscription: Subscription;
  constructor(private appService: AppService, private router: Router) {
    this.subscription = appService.filterOn('post:send:password')
      .subscribe(d => {
        if (d.data.error) {
          console.log(d.data.error.status)
        } else {
          console.log('Success');
          this.router.navigate(['/login']);
        }
      });
  };
  sendPassword() {
    let code = window.location.search.split('=')[1];
    console.log(code);
    this.appService.httpPost('post:send:password', { auth: code });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

//change password component
@Component({
  templateUrl: 'app/components/managePassword/changePassword.component.html'
})
export class ChangePassword {
  changePwdForm: FormGroup;
  subscription: Subscription;
  alert: any = {};
  constructor(private appService: AppService, private router: Router, private fb: FormBuilder) {
    this.subscription = appService.filterOn('post:change:password')
      .subscribe(d => {
        if (d.data.error) {
          console.log(d.data.error.status);
          //this.alert.show=true;
          this.appService.showAlert(this.alert, true, 'changePasswordFailed')

        } else {
          this.appService.resetCredential();
          this.appService.showAlert(this.alert,true,'','success');
        }
      });
  };

  ngOnInit() {
    this.changePwdForm = this.fb.group({
      oldPassword: ['', Validators.required]
      , newPassword1: ['', Validators.required]
      , newPassword2: ['', Validators.required
        //, this.testAsync.bind(this)
        ]
    }, { validator: this.checkFormGroup });
  };
  // testAsync(control) {
  //   let pr = new Promise((resolve, reject) => {
  //     this.appService.filterOn('get:default:credit:card').subscribe(d => {
  //       if (d.data.error) {
  //         console.log('Error in default credit card');
  //       } else {
  //         resolve({ testError: true });
  //       }
  //     });
  //     this.appService.httpGet('get:default:credit:card');
  //   });
  //   return (pr);
  // }
  checkFormGroup(group) {
    let ret = null;
    if (group.dirty) {
      if (group.value.oldPassword == group.value.newPassword1) {
        ret = { 'oldAndNewPasswordsSame': true }
      } else if (group.value.newPassword1 != group.value.newPassword2) {
        ret = { 'confirmPasswordMismatch': true };
      }
    }
    return (ret);
  };
  changePassword(oldPwd, newPwd1, newPwd2) {
    let credential = this.appService.getCredential();
    if (credential) {
      let email = credential.email;
      if (email) {
        if (newPwd1 === newPwd2) {
          let base64Encoded = this.appService.encodeBase64(email + ':' + md5(oldPwd) + ':' + md5(newPwd1));
          console.log(base64Encoded);
          this.appService.httpPost('post:change:password', { auth: base64Encoded, token: credential.token });
        }
      } else {
        this.router.navigate(['/login']);
      }
    }
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}