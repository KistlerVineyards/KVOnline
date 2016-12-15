import { Component } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Subscription } from 'rxjs/subscription';
import { AppService } from '../services/app.service';
import { viewBoxConfig } from '../config';

@Component({
  selector: 'my-app',
  templateUrl: 'app/components/app.component.html'
})

export class AppComponent {
  subscription: Subscription;
  initDataSub: Subscription;
  home: string = '#';
  kistler: string = '#';
  viewBox: {} = viewBoxConfig['/login'];

 showMenu: boolean = false;
  myAccountshowMenu: boolean = false;
  currentUser: string = "";

 
  constructor(private appService: AppService, private router: Router) {
    this.initMenu(window.innerWidth);
    let credential = appService.getCredential();
    if (credential) {
      this.currentUser = credential.email;
    }
    this.initDataSub = appService.filterOn('get:init:data').subscribe(d => {
      
      if (d.data.error) {
        console.log(d.data.error);
      } else {
        //this.home = d.data.host;
        this.kistler = d.data.kistler;
      }
    });    
    router.events.filter((e: Event, t: number) => {
      return (e.constructor.name === 'NavigationEnd');
    }).subscribe((event: any) => {
      let url = event.urlAfterRedirects.split('?')[0];
      this.viewBox = viewBoxConfig[url];
    });
  };
  logout() {
    this.appService.resetCredential();
  };

  hideMenu() {
    if(window.innerWidth > 768){
    this.showMenu=true;
    this.myAccountshowMenu=true;
    }else{
       this.showMenu=false;
    this.myAccountshowMenu=false;
    }
  };

  ngOnInit() {
    this.appService.httpGet('get:init:data');
  };
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.initDataSub.unsubscribe();
  };
  menuToggle(){
  this.showMenu = !this.showMenu;
  };
  myAccountToggle(){
  this.myAccountshowMenu = !this.myAccountshowMenu;
  };
  initMenu(windowSize) {
    if (windowSize > 768) {
      this.showMenu = true;
      this.myAccountshowMenu = true;
    } else {
      this.showMenu = false;
      this.myAccountshowMenu = false;
    }
  }
 onResize(event) {
  this.initMenu(event.target.innerWidth);
};

}
