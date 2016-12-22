import { Component } from '@angular/core';
import { AppService } from '../../services/app.service';

@Component({
    templateUrl: 'app/components/receipt/receipt.component.html'
})
export class Receipt {
    staticTexts: any = {};
    constructor(private appService: AppService) {
        this.staticTexts.header = appService.getMessage('mess:receipt:heading');
        let email = this.appService.getCredential().user.email;
        this.staticTexts.info = appService.getMessage('mess:receipt:info').replace('@email', email);
    };
}