import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from '../../services/customValidators';
import { Subscription } from 'rxjs/Subscription';
import { AppService } from '../../services/app.service';
import { AlertModule } from 'ng2-bootstrap/components/alert';
import { Message } from 'primeng/components/common/api';
import { GrowlModule } from 'primeng/components/growl/growl';
import { ControlMessages } from '../controlMessages/controlMessages.component';
import { md5 } from '../../vendor/md5';

@Component({
  templateUrl: 'app/components/forgotPassword/forgotPassword.component.html'
})
export class ForgotPassword {
  subscription: Subscription;
  forgotForm: FormGroup;
  alert: any = {};  
  constructor(private appService: AppService, private router: Router, private fb: FormBuilder) {
    this.subscription = appService.filterOn('post:forgot:password')
      .subscribe(d => {
        if (d.data.error) {
          //console.log(d.data.error.status);
          this.appService.showAlert(this.alert, true, 'emailNotFound');
        } else {
          console.log('Success');
          this.router.navigate(['/login']);
        }
      });
  };
  ngOnInit() {
    this.forgotForm = this.fb.group({
      codeOrMail: ['', Validators.required]
    });
  };
  sendMail(codeOrMail) {
     this.alert = {};
    let base64Encoded = this.appService.encodeBase64(codeOrMail);
    this.appService.httpPost('post:forgot:password', { auth: base64Encoded });
  };
  cancel() {
    this.router.navigate(['/login']);
  };
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}