import { Http, Response, Headers, RequestOptionsArgs, ResponseContentType } from '@angular/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/subject';
import { Observable } from 'rxjs/observable';
import { BehaviorSubject } from 'rxjs/behaviorsubject';
import {
    CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot
} from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';
import { Message } from 'primeng/components/common/api';
// import { GrowlModule } from 'primeng/components/growl/growl';
//import * as _ from 'lodash';
import { urlHash, messages, validationErrorMessages } from '../config';

@Injectable()
export class AppService {
    subject: Subject<any>;
    //hot observable for event triggers. This is entire application wide event trigger system in hot manner. You need not have to subscribe before the event is triggered. Even if you subscribe after event is triggered you get the results.
    // behSubject: BehaviorSubject<any>;
    // behSettingsSubject: BehaviorSubject<any>;
    behaviorSubjects: any;
    mastersSubscription: Subscription;
    settingsSubscription: Subscription;
    channel: any;
    globalSettings: any = {};
    countries: [{ any }];

    constructor(private http: Http) {
        this.subject = new Subject();
        this.behaviorSubjects = {
            'masters:download:success': new BehaviorSubject({ id: '1', data: {} }),
            'settings:download:success': new BehaviorSubject({ id: '1', data: {} })
        };
        this.channel = {};
        this.mastersSubscription = this.filterOn('get:all:masters').subscribe(
            d => {
                if (d.data.error) {
                    console.log(d.data.error);
                } else {
                    let data = JSON.parse(d.data);
                    this.countries = data.Table;
                    this.behEmit('masters:download:success');
                }
            });

        setTimeout(() => {
            this.httpGet('get:all:masters')
        }, 2000);

        this.settingsSubscription = this.filterOn('get:all:settings').subscribe(
            d => {
                if (d.data.error) {
                    console.log(d.data.error);
                } else {
                    let data = JSON.parse(d.data);
                    if (data.Table) {
                        this.globalSettings.smartyStreetApiKey = data.Table[0].smartyStreetApiKey;
                        this.globalSettings.smartyStreetAuthId = data.Table[0].smartyStreetAuthId;
                        this.globalSettings.smartyStreetAuthToken = data.Table[0].smartyStreetAuthToken;
                        this.globalSettings.creditCardTypes = data.Table[0].creditCardTypes.split(",").map(function (item) {
                            return item.trim();
                        });
                        this.globalSettings.needHelpText = data.Table[0].needHelpText;
                        this.globalSettings.onlineOrder = {};
                        //this.globalSettings.onlineOrder.disableOnlineOrderForm = data.Table[0].disableOnlineOrderForm;
                        this.globalSettings.onlineOrder.disableOnlineOrderText = data.Table[0].disableOnlineOrderText;
                        //this.globalSettings.onlineOrder.minOrderBottles = data.Table[0].minOrderBottles;
                        //this.globalSettings.onlineOrder.minOrderpackages = data.Table[0].minOrderpackages;
                        //this.globalSettings.onlineOrder.welcomeNote = data.Table[0].welcomeNote;
                    }
                    this.behEmit('settings:download:success');
                }
            });
    };

    behEmit(id: string, options?: any) {
        this.behaviorSubjects[id].next({ id: id, data: options });
    };

    behFilterOn(id: string): Observable<any> {
        return (this.behaviorSubjects[id]);
    };

    loadSettings() {
        if (Object.keys(this.globalSettings).length === 0) {
            let body: any = {};
            body.data = JSON.stringify({ sqlKey: "GetSiteSettings" })
            this.httpGet('get:all:settings', body);
        }
        else {
            this.behEmit('settings:download:success');
        }
    };

    clearSettings() {
        this.globalSettings = {};
    };

    getSetting(GlobalSettingsKey) {
        return (this.globalSettings[GlobalSettingsKey]);
    };

    getCountries() {
        return (this.countries);
    };

    getMessage(messageKey) {
        return (messages[messageKey]);
    };

    getValidationErrorMessage(key) {
        return (validationErrorMessages[key]);
    };

    setCredential(user, token, inactivityTimeoutSecs) {
        let credential = { user: user, token: token, inactivityTimeoutSecs: inactivityTimeoutSecs };
        localStorage.setItem('credential', JSON.stringify(credential));
    };

    getCredential(): any {
        let credentialString = localStorage.getItem('credential');
        let credential;
        if (credentialString) {
            credential = JSON.parse(credentialString);
        }
        return (credential);
    };

    getToken(): string {
        let token = null;
        let credential = this.getCredential();
        if (credential) {
            token = credential.token;
        }
        return (token);
    };

    resetCredential() {
        localStorage.removeItem('credential');
    };

    showAlert(alert: any, show: boolean, id?: string, type?: string) {
        alert.show = show;
        if (id) {
            alert.message = this.getValidationErrorMessage(id);
            if (!type) {
                type = 'danger';
            }
            alert.type = type;
        }
    };

    httpPost(id: string, body?: any) {
        let url = urlHash[id];
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('x-access-token', this.getToken());
        body.token = this.getToken();
        this.http.post(url, body, { headers: headers })
            .map(response => response.json())
            .subscribe(d =>
                this.subject.next({
                    id: id, data: d, body: body
                }), err =>
                this.subject.next({
                    id: id,
                    data: { error: err }
                }));
    };

    httpGet(id: string, body?: any) {
        var url = urlHash[id];
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('x-access-token', this.getToken());
        if (body) {
            if (body.id) {
                url = url.replace(':id', body.id);
            }
            if (body.data) {
                headers.append('data', body.data);
            }
            if (body.usAddress) {
                headers.delete('x-access-token');
                url = url.replace(':authId', this.globalSettings.smartyStreetAuthId)
                    .replace(':authToken', this.globalSettings.smartyStreetAuthToken)
                    .replace(':street', encodeURIComponent(body.usAddress.street))
                    .replace(':street2', encodeURIComponent(body.usAddress.street2))
                    .replace(':city', encodeURIComponent(body.usAddress.city))
                    .replace(':state', encodeURIComponent(body.usAddress.state))
                    .replace(':zipcode', encodeURIComponent(body.usAddress.zipcode))
            }
        }
        this.http.get(url, { headers: headers })
            .map(response => response.json())
            .subscribe(d =>
                this.subject.next({
                    id: id, data: d
                }), err =>
                this.subject.next({
                    id: id,
                    data: { error: err }
                }));
    };

    httpDelete(id: string, body?: any) {
        let url = urlHash[id];
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('x-access-token', this.getToken());
        this.http.delete(url, { headers: headers, body: { id: body.id } })
            .map(response => response.json())
            .subscribe(d =>
                this.subject.next({
                    id: id, data: d, index: body.index
                }), err =>
                this.subject.next({
                    id: id,
                    data: { error: err }
                }));
    };

    httpPut(id: string, body?: any) {
        let url = urlHash[id];
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('x-access-token', this.getToken());
        body.token = this.getToken();
        this.http.put(url, body, { headers: headers })
            .map(response => response.json())
            .subscribe(d =>
                this.subject.next({
                    id: id, data: d, body: body
                }), err =>
                this.subject.next({
                    id: id,
                    data: { error: err }
                }));
    };
    //application wide events
    emit(id: string, options?: any) {
        this.subject.next({
            id: id, data: options
        });
    };

    filterOn(id: string): Observable<any> {
        return (this.subject.filter(d => (d.id === id)));
    };

    reply(key: string, value: any) {
        this.channel[key] = value;
    };

    request(key: string, payload?: any): any {
        let ret: any = undefined;
        if (payload) {
            ret = this.channel[key](payload);
        } else {
            ret = this.channel[key];
        }
        return (ret);
    };

    reset(key: string) {
        delete this.channel[key];
    };

    encodeBase64(inputString) {
        let Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/\r\n/g, "\n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var c1: number, c2: number, c3: any; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }
        return (Base64.encode(inputString));
    };

    ngOnDestroy() {
        this.mastersSubscription.unsubscribe();
        this.settingsSubscription.unsubscribe();
    };
};

@Injectable()
export class LoginGuard implements CanActivate {
    constructor(private appService: AppService, private http: Http, private router: Router)
    { }

    canActivate(
        // Not using but worth knowing about
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ) {
        let ret: any = false;
        let credential = this.appService.getCredential();
        if (credential) {
            let token = credential.token;
            if (token) {
                ret = this.isLoggedIn(token);
            } else {
                this.router.navigate(['/login']);
            }
        }
        return (ret);
    };

    isLoggedIn(token): Observable<boolean> | boolean {
        //let router: Router = this.router;
        let obs;
        try {
            //let options = new RequestOptions({body:{token:token}});
            let url = urlHash['post:validate:token'];
            obs = this.http.post(url, { token: token })
                .map(result => result.json());
        } catch (err) {
            obs = Observable.of(false);
        }

        return obs
            .map(success => {
                // navigate to login page
                if (!success) {
                    this.router.navigate(['/login']);
                }
                return success;
            });
    }
}

