"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var app_service_1 = require("../../services/app.service");
var Order = (function () {
    function Order(appService, router) {
        var _this = this;
        this.appService = appService;
        this.router = router;
        this.alert = {
            show: false,
            type: 'danger',
            message: ''
        };
        this.excessOrder = this.appService.getValidationErrorMessage('excessOrder');
        this.minOrderBottles = 0;
        this.minOrderPackages = 0;
        this.staticTexts = {
            introText: this.appService.getMessage('mess:order:intro:text'),
            holidayGift: this.appService.getMessage('mess:order:holiday:gift'),
            minimumRequest: this.appService.getMessage('mess:order:minimum:request'),
            bottomNotes: this.appService.getMessage('mess:order:bottom:notes'),
            salutation: ""
        };
        this.isholidayGift = false;
        this.isShowHolidayGiftOption = false;
        this.disableOnlineOrderForm = false;
        //this.onlineOrder = appService.getSetting('onlineOrder');
        this.currentOfferSubscription = appService.filterOn('get:current:offer')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                _this.orders = JSON.parse(d.data).Table.map(function (value, i) {
                    value.orderQty = 0;
                    value.wishList = 0;
                    if (value.packing == 'b') {
                        value.imageUrl = "2014_Cuvee_Cathleen_Chardonnay.jpg";
                    }
                    value.imageUrl = value.imageUrl != null ? 'app/assets/img/' + value.imageUrl : null;
                    return (value);
                });
            }
        });
        this.saveOrderSubscription = appService.filterOn('post:save:order')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                console.log(d);
            }
        });
        this.currentSettingsSubscription = appService.filterOn('get:current:settings')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                _this.onlineOrder = {};
                var settingsData = JSON.parse(d.data);
                if (settingsData.Table.length > 0) {
                    var settings = settingsData.Table[0];
                    _this.minOrderBottles = settings.MinOrderBottles;
                    _this.minOrderPackages = settings.MinOrderpackages;
                    _this.staticTexts.minimumRequest = "Minimum request " + _this.minOrderBottles + " bottles or " + _this.minOrderPackages + " 6-bottle package";
                    //this.staticTexts.bottomNotes = "Wines in " + settings.MinOrderBottles+ " bottle packages are subject to change";;
                    _this.isShowHolidayGiftOption = !settings.HideHolidayGiftCheckBox; // == "true" ? true : false;
                    //console.log("this.isShowHolidayGiftOption="+this.isShowHolidayGiftOption);
                    _this.staticTexts.introText = settings.WelcomeNote;
                    _this.disableOnlineOrderForm = settings.DisableOnlineOrderForm;
                }
                if (settingsData.Table1.length > 0) {
                    _this.staticTexts.salutation = settingsData.Table1[0].name;
                }
                if (settingsData.Table2.length > 0) {
                    _this.disableOnlineOrderText = settingsData.Table2[0].disableOnlineOrderText;
                }
            }
        });
    }
    ;
    Order.prototype.toggleDetails = function (order) {
        if (order.isShowDetails) {
            order.isShowDetails = false;
        }
        else {
            this.orders.map(function (a) {
                a.isShowDetails = false;
            });
            order.isShowDetails = true;
        }
    };
    ;
    // save() {
    //   let finalOrder = this.orders.map(function (value, i) {
    //     return ({ offerId: value.id, orderQty: value.orderQty, wishList: value.wishList })
    //   });
    //   let token = this.appService.getToken();
    //   this.appService.httpPost('post:save:order', { token: token, order: finalOrder });
    // };
    Order.prototype.request = function () {
        var totalRequestedBottles = 0;
        var totalRequestedPackagess = 0;
        var ords = this.orders.filter(function (a) {
            if (a.packing == 'p') {
                totalRequestedPackagess += a.orderQty;
                totalRequestedBottles += a.orderQty * 6;
            }
            else {
                if (a.packing == 's') {
                    totalRequestedBottles += a.orderQty * 3;
                }
                else {
                    totalRequestedBottles += a.orderQty;
                }
            }
            return ((a.orderQty && a.orderQty > 0) || (a.wishList && a.wishList > 0));
        });
        var index = this.orders.findIndex(function (a) { return a.orderQty > a.availableQty; });
        if (index != -1) {
            this.alert.show = true;
            this.alert.message = this.appService.getValidationErrorMessage('someExcessOrder');
        }
        else {
            if (ords.length > 0) {
                if (totalRequestedBottles >= this.minOrderBottles || (totalRequestedPackagess >= this.minOrderPackages && this.minOrderPackages > 0)) {
                    this.alert.show = false;
                    this.alert.message = '';
                    //this.orders.isholidayGift=this.isholidayGift;
                    this.appService.reply('orders', this.orders);
                    this.appService.reply('holidaygift', this.isholidayGift);
                    this.router.navigate(['approve/order']);
                }
                else {
                    //'minimumOrderviolation': 'One or many of the requests exceeds available quantity'
                    this.alert.show = true;
                    this.alert.message = "Invalid request. Minimum request should be " + this.minOrderBottles + " bottles or " + this.minOrderPackages + " 6-bottle package";
                }
            }
            else {
                this.alert.show = true;
                this.alert.message = this.appService.getValidationErrorMessage('emptyOrder');
            }
        }
    };
    Order.prototype.ngOnInit = function () {
        var ords = this.appService.request('orders');
        if (ords) {
            this.orders = ords;
            //this.isholidayGift = this.orders.isholidayGift;
            this.isholidayGift = this.appService.request('holidaygift');
        }
        else {
            this.appService.httpGet('get:current:offer');
        }
        this.appService.httpGet('get:current:settings');
    };
    ;
    Order.prototype.ngOnDestroy = function () {
        this.currentOfferSubscription.unsubscribe();
        this.saveOrderSubscription.unsubscribe();
        this.currentSettingsSubscription.unsubscribe();
    };
    return Order;
}());
Order = __decorate([
    core_1.Component({
        templateUrl: 'app/components/order/order.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService, router_1.Router])
], Order);
exports.Order = Order;
//# sourceMappingURL=order.component.js.map