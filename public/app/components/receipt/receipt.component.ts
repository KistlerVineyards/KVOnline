import { Component } from '@angular/core';
import { AppService } from '../../services/app.service';

@Component({
    templateUrl: 'app/components/receipt/receipt.component.html'
})
export class Receipt {
    staticTexts: any = {};
    constructor(private appService: AppService) {
        let email = this.appService.getCredential().user.email;
        this.staticTexts.info = appService.getMessage('mess:receipt:info').replace('@email', email);
        let release = appService.getCredential().user.role;
        if(!release){
            release ="Spring 2017";
        }
        this.staticTexts.header = appService.getMessage('mess:receipt:heading').replace('@release', release);
        
    };
}