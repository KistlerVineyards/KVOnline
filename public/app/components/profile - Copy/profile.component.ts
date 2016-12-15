import { Component } from '@angular/core';
import { Subscription } from 'rxjs/subscription';
import { AppService } from '../../services/app.service';
import {DatepickerModule} from 'ng2-bootstrap';
@Component({
    templateUrl: 'app/components/profile/profile.component.html'
})
export class Profile {
    getProfileSubscription: Subscription;
    saveProfileSubscription: Subscription;
    profile: {} = {};
    dt:any;  
    constructor(private appService: AppService) {
        this.getProfileSubscription = appService.filterOn('get:user:profile')
            .subscribe(d => {
                if (d.data.error) {
                    console.log(d.data.error);
                } else {
                    let profileArray = JSON.parse(d.data).Table;
                    if (profileArray.length > 0) {
                        this.profile = profileArray[0];
                    }
                }
            }, err => {
                console.log(err);
            });

        this.saveProfileSubscription = appService.filterOn('post:save:profile')
            .subscribe(d => {
                console.log(d);
            });
    };
    ngOnInit() {
        let token = this.appService.getToken();
        this.appService.httpGet('get:user:profile', { token: token });
    };
    submit() {
        let token = this.appService.getToken();
        this.appService.httpPost('post:save:profile', { token: token, profile: this.profile });
    }
    ngOnDestroy() {
        this.getProfileSubscription.unsubscribe();
        this.saveProfileSubscription.unsubscribe();
    };
}