import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
//import { CustomValidators } from '../../services/customValidators';
import { ControlMessages } from '../controlMessages/controlMessages.component';
import { AppService } from '../../services/app.service';
import { AlertModule } from 'ng2-bootstrap/components/alert';

@Component({
  templateUrl: 'app/components/order/order.component.html'
})
export class Order {
  alert: any = {
    show: false,
    type: 'danger',
    message: ''
  };
  onlineOrder: any = {};
  excessOrder: string = this.appService.getValidationErrorMessage('excessOrder');
  email: string;
  minOrderBottles=0;
  minOrderPackages=0;
  minOrderPackagestext="";
  staticTexts: {
    introText: string,
    holidayGift: string,
    minimumRequest: string,
    bottomNotes: string,
    salutation: string
  } = {
    introText: this.appService.getMessage('mess:order:intro:text'),
    holidayGift: this.appService.getMessage('mess:order:holiday:gift'),
    minimumRequest: this.appService.getMessage('mess:order:minimum:request'),
    bottomNotes: this.appService.getMessage('mess:order:bottom:notes'),
    salutation:""
  };
  isholidayGift:boolean=false;
  isShowHolidayGiftOption:boolean = false;
  disableOnlineOrderForm :boolean = false;
  disableOnlineOrderText:string;
  currentOfferSubscription: Subscription;
  saveOrderSubscription: Subscription;
  currentSettingsSubscription: Subscription;
  noAllocation :boolean = false;
  orders: any[];
  user: any = {};
  constructor(private appService: AppService, private router: Router) {
    //this.onlineOrder = appService.getSetting('onlineOrder');
    this.user = appService.getCredential().user;
    this.currentOfferSubscription = appService.filterOn('get:current:offer')
      .subscribe(d => {
        if (d.data.error) {
          this.noAllocation=false;
          console.log(d.data.error);
        } else {
          if(JSON.parse(d.data).Table.length == 0){
            this.noAllocation=true;
          }
          else{
              this.noAllocation=false;
              this.orders = JSON.parse(d.data).Table.map(function (value, i) {
              value.orderQty = 0;
              value.wishList = 0;
              if(value.packing =='b'){
                //value.imageUrl="2014_Cuvee_Cathleen_Chardonnay.jpg";
                if(!value.imageUrl)
                {
                  value.imageUrl="2014_Cuvee_Cathleen_Chardonnay.jpg";
                }
              }
              let productType = value.productType;
              productType = productType.substr(0, 1).toUpperCase() + productType.substr(1);
              value.productType = productType;
              let allocationDesription = value.allocationDescription;
              allocationDesription = allocationDesription.toString().replace('Btls', 'Bottles');
              allocationDesription = allocationDesription.toString().replace('Pkg', 'Package');
              value.allocationDescription = allocationDesription;
              value.imageUrl = value.imageUrl != null ? 'app/assets/img/' + value.imageUrl : null;
              let item = value.item;
              item = item.toString().replace('6 bottle', '6-bottle');
              item = item.toString().replace('6 Bottle', '6-bottle');
              return (value);
            });
          }
        }
      });
    this.saveOrderSubscription = appService.filterOn('post:save:order')
      .subscribe(d => {
        if (d.data.error) {
          console.log(d.data.error);
        } else {
          console.log(d);
        }
      });
    this.currentSettingsSubscription = appService.filterOn('get:current:settings')
    .subscribe(d => {
      if (d.data.error) {
        console.log(d.data.error);
      } else {
                  this.onlineOrder = {};
                  let settingsData = JSON.parse(d.data);
                  if (settingsData.Table.length > 0) {
                        let settings = settingsData.Table[0];
                        this.minOrderBottles = settings.MinOrderBottles;
                        this.minOrderPackages = settings.MinOrderpackages;
                        
                        if(settings.MinOrderpackages == 1)
                        {
                          this.minOrderPackagestext = "One";
                        }
                        else if(settings.MinOrderpackages == 1)
                        {
                          this.minOrderPackagestext = "Two";
                        }
                        else if(settings.MinOrderpackages)
                        {
                          this.minOrderPackagestext = "Three";
                        }
                        else 
                        {
                          this.minOrderPackagestext = settings.MinOrderpackages;
                        }
                        
                        this.staticTexts.minimumRequest = "Minimum request " + this.minOrderBottles + " bottles or " + this.minOrderPackagestext + " 6-bottle package";
                        //this.staticTexts.bottomNotes = "Wines in " + settings.MinOrderBottles+ " bottle packages are subject to change";;
                        this.isShowHolidayGiftOption = !settings.HideHolidayGiftCheckBox;// == "true" ? true : false;
                        //console.log("this.isShowHolidayGiftOption="+this.isShowHolidayGiftOption);
                        this.staticTexts.introText = settings.WelcomeNote;
                        
                        this.disableOnlineOrderForm=settings.DisableOnlineOrderForm;
                        this.disableOnlineOrderText=settings.DisableMessage;
                  }
                  if (settingsData.Table1.length > 0) {
                      this.staticTexts.salutation = settingsData.Table1[0].name;
                  }
                  /*if (settingsData.Table2.length > 0) {
                      this.disableOnlineOrderText=settingsData.Table2[0].disableOnlineOrderText;
                  }*/
      }
    });
  };
      isNumber(evt) {
        evt = (evt) ? evt : window.event;
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    };  
  isValidEntry(a) {
    if(a.orderQty == null){
       return false;
    }
    
    if(a.wishList == null){
       return false;
    }
    return true;
  };  
  toggleDetails(order) {
    if (order.isShowDetails) {
      order.isShowDetails = false;
    } else {
      this.orders.map((a) => {
        a.isShowDetails = false;
      });
      order.isShowDetails = true;
    }
  };
  // save() {
  //   let finalOrder = this.orders.map(function (value, i) {
  //     return ({ offerId: value.id, orderQty: value.orderQty, wishList: value.wishList })
  //   });
  //   let token = this.appService.getToken();
  //   this.appService.httpPost('post:save:order', { token: token, order: finalOrder });
  // };
  allAllocation()
  {
    let ords = this.orders.filter((a) => {
      a.orderQty = a.availableQty;
      if(a.wishList == null)
       a.wishList = 0; 
    });
     this.alert.show = false;
     this.alert.message = '';
  };
  request() {
    let totalRequestedBottles = 0;
    let totalRequestedPackagess = 0;
    let ords = this.orders.filter((a) => {
      if(a.packing == 'p')
      {
        totalRequestedPackagess += a.orderQty;
        totalRequestedBottles += a.orderQty * 6;
      }
      else
      {
        if(a.packing == 's')
        {
          totalRequestedBottles += a.orderQty * 3;
        }
        else
        {
          totalRequestedBottles += a.orderQty;
        }
      }
      return ((a.orderQty && a.orderQty > 0) || (a.wishList && a.wishList > 0));
    });
    let negativeValue = this.orders.find((order, index) => {
      return ((order.orderQty < 0) || (order.wishList < 0));
    });
    let nonNumericValue = this.orders.find((order, index) => {
      if(order.orderQty == null){
        return true;
      }
      else if(order.wishList == null){
        return true;
      }
      else{
        return false;
      }
    });
    let index = this.orders.findIndex(a => (a.orderQty > a.availableQty && !this.user.isAdmin));
    if(nonNumericValue){
      this.alert.show = true;
      this.alert.message = ("Invalid quantity exists in your request.");    
    }
    if (negativeValue) {
      this.alert.show = true;
      this.alert.message = this.appService.getValidationErrorMessage('someNegativeValues');
    } else {
    if (index != -1) {
      this.alert.show = true;
      this.alert.message = this.appService.getValidationErrorMessage('someExcessOrder');
    } 
    else {
      if (ords.length > 0) {
        let minmumrequestSatisfied = false;
        if(totalRequestedBottles >= this.minOrderBottles || (totalRequestedPackagess >= this.minOrderPackages && this.minOrderPackages > 0) ){
          minmumrequestSatisfied = true;
        }
        if(this.user.noMinimumOrder == "True" || this.user.isAdmin)
        {
          minmumrequestSatisfied = true;
        }
        if(minmumrequestSatisfied && !nonNumericValue){        
          this.alert.show = false;
          this.alert.message = '';
          //this.orders.isholidayGift=this.isholidayGift;
          this.appService.reply('orders', this.orders);        
          this.appService.reply('holidaygift', this.isholidayGift);
          this.router.navigate(['approve/order']);
        }else{
          if(!nonNumericValue){
          //'minimumOrderviolation': 'One or many of the requests exceeds available quantity'
          this.alert.show = true;
          this.alert.message = "Invalid request. Minimum request should be " + this.minOrderBottles + " bottles or " + this.minOrderPackages+" 6-bottle package";
          }
        }
      } else {
        this.alert.show = true;
        this.alert.message = this.appService.getValidationErrorMessage('emptyOrder');
      }
    }
  }
}
  ngOnInit() {
    let ords = this.appService.request('orders');
    if (ords) {
      this.orders = ords;
      //this.isholidayGift = this.orders.isholidayGift;
      this.isholidayGift = this.appService.request('holidaygift');
    } else {
      this.appService.httpGet('get:current:offer');
    }
    this.appService.httpGet('get:current:settings');
  };
  ngOnDestroy() {
    this.currentOfferSubscription.unsubscribe();
    this.saveOrderSubscription.unsubscribe();
    this.currentSettingsSubscription.unsubscribe();
  }
}