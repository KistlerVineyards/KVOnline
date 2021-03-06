import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from '../../services/customValidators';
import { Subscription } from 'rxjs/Subscription';
import { AppService } from '../../services/app.service';
import { AlertModule } from 'ng2-bootstrap/components/alert';
import { Message } from 'primeng/components/common/api';
import { GrowlModule } from 'primeng/components/growl/growl';
import { Modal, ModalModule } from "ng2-modal"
import { ControlMessages } from '../controlMessages/controlMessages.component';
import { md5 } from '../../vendor/md5';

@Component({
  templateUrl: 'app/components/changePassword/changePassword.component.html'
})
export class ChangePassword {
  changePwdForm: FormGroup;
  subscription: Subscription;
  alert: any = {};
  messages: Message[] = [];
  @ViewChild('loginSuccessModal') loginSuccessModal: Modal;
  constructor(private appService: AppService, private router: Router, private fb: FormBuilder) {
    this.subscription = appService.filterOn('post:change:password')
      .subscribe(d => {
        if (d.data.error) {
          console.log(d.data.error.status);
          this.appService.showAlert(this.alert, true, 'changePasswordFailed')

        } else {
          this.appService.resetCredential();
          this.appService.showAlert(this.alert, false)
          this.messages = [];
          this.messages.push({
            severity: 'success'
            , summary: 'Saved'
            , detail: 'Data saved successfully'
          });
          this.loginSuccessModal.open();
          //this.router.navigate(['/login']);
        }
      });
  };

  ngOnInit() {
    this.changePwdForm = this.fb.group({
      oldPassword: ['', Validators.required]
      , newPassword1: ['', [Validators.required, CustomValidators.pwdComplexityValidator]]
      , newPassword2: ['', [Validators.required, CustomValidators.pwdComplexityValidator]]
    }, { validator: this.checkFormGroup });
  };

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
      let email = credential.user.email;
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