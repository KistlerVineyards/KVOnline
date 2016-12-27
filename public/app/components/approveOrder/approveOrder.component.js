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
//import { Location } from '@angular/common';
var app_service_1 = require("../../services/app.service");
var router_1 = require("@angular/router");
var config_1 = require("../../config");
var ng2_modal_1 = require("ng2-modal");
var ApproveOrder = (function () {
    function ApproveOrder(appService, router) {
        var _this = this;
        this.appService = appService;
        this.router = router;
        this.selectedAddress = {};
        this.selectedCard = {};
        this.defaultCard = {};
        this.allTotals = {};
        this.footer = {
            wineTotals: {
                wine: 0.00, addl: 0.00
            },
            salesTaxPerc: 0.00,
            shippingCharges: 0.00,
            shippingTotals: { wine: 0.00 / 1, addl: 0.00 / 1 },
            prevBalances: { wine: 0.00 / 1, addl: 0.00 / 1 },
            grandTotals: { wine: 0.00 / 1, addl: 0.00 / 1 },
            salesTaxTotals: { wine: 0.00 / 1, addl: 0.00 / 1 }
        };
        this.approveHeading = config_1.messages['mess:approve:heading'];
        this.allAddresses = [{}];
        // allCards: [any] = [{}];
        this.payMethods = [{}];
        this.holidaygift = false;
        this.isChangeAddress = false;
        this.shippingBottles = {};
        //orderBundle: any = {};
        this.profile = {};
        this.alert = { type: "success" };
        this.payLater = function () {
            if (!_this.selectedCard || _this.selectedCard == '') {
                return ('Pay later');
            }
            else {
                return ('');
            }
        };
        var ords = appService.request('orders');
        if (!ords) {
            router.navigate(['order']);
        }
        this.getProfileSubscription = appService.filterOn('get:user:profile')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                var profileArray = JSON.parse(d.data).Table;
                if (profileArray.length > 0) {
                    _this.profile = profileArray[0];
                }
            }
        });
        this.postApproveSubscription = appService.filterOn('post:save:approve:request').subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                _this.appService.reset('orders');
                _this.router.navigate(['receipt']);
            }
        });
        this.approveArtifactsSub = appService.filterOn('get:approve:artifacts').subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                var artifacts = JSON.parse(d.data);
                if (artifacts.Table.length > 0) {
                    _this.selectedCard = _this.defaultCard = artifacts.Table[0];
                }
                else {
                    _this.selectedCard = {};
                }
                if (artifacts.Table1.length > 0) {
                    if (!_this.isChangeAddress) {
                        _this.selectedAddress = artifacts.Table1[0];
                        _this.selectedAddress.salesTaxPerc = _this.selectedAddress.isoCode != "US" ? 0 : _this.selectedAddress.salesTaxPerc;
                        _this.selectedAddress.shippingCharges = _this.selectedAddress.isoCode != "US" ? 0 : _this.selectedAddress.shippingCharges;
                        _this.selectedAddress.addlshippingCharges = _this.selectedAddress.isoCode != "US" ? 0 : _this.selectedAddress.addlshippingCharges;
                    }
                }
                else {
                    _this.selectedAddress = {};
                    _this.selectedAddress.salesTaxPerc = 0;
                    _this.selectedAddress.shippingCharges = 0;
                    _this.selectedAddress.addlshippingCharges = 0;
                }
                if (artifacts.Table2.length > 0) {
                    _this.footer.prevBalance = artifacts.Table2[0] / 1;
                    _this.footer.prevBalances = { wine: artifacts.Table2[0].prevBalanceWine, addl: artifacts.Table2[0].prevBalanceAddl };
                }
                else {
                    _this.footer.prevBalances = { wine: 0.00, addl: 0.00 };
                }
            }
            _this.computeTotals();
        });
        this.allAddrSubscription = appService.filterOn('get:shipping:address').subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                _this.allAddresses = JSON.parse(d.data).Table;
            }
        });
        this.allCardSubscription = appService.filterOn('get:payment:method').subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                _this.payMethods = JSON.parse(d.data).Table;
            }
        });
        this.shippingandSalesTaxSub = appService.filterOn('get:approve:artifacts:ShippingandSalesTax').subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                var shippingandSaletax = JSON.parse(d.data).Table;
                if (shippingandSaletax.length == 2) {
                    _this.selectedAddress.shippingCharges = shippingandSaletax[0].ShipPrice;
                    _this.selectedAddress.addlshippingCharges = shippingandSaletax[1].ShipPrice;
                    _this.selectedAddress.salesTaxPerc = shippingandSaletax[0].SalesTaxRate;
                }
                else {
                    _this.selectedAddress.shippingCharges = shippingandSaletax[0].ShipPrice;
                    _this.selectedAddress.salesTaxPerc = shippingandSaletax[0].SalesTaxRate;
                    if (_this.shippingBottles.requestedShippingBottle == _this.shippingBottles.additinalShippingBottle) {
                        _this.selectedAddress.addlshippingCharges = shippingandSaletax[0].ShipPrice;
                    }
                    else {
                        _this.selectedAddress.addlshippingCharges = 0;
                    }
                }
            }
            _this.computeTotals();
        });
    }
    ;
    ApproveOrder.prototype.changeSelectedAddress = function () {
        this.isAlert = false;
        this.isChangeAddress = true;
        this.appService.httpGet('get:shipping:address');
        this.addrModal.open();
    };
    ;
    ApproveOrder.prototype.selectAddress = function (address) {
        this.selectedAddress = address;
        this.addrModal.close();
        if (this.selectedAddress.isoCode == "US") {
            this.getShippingandSalesTax();
        }
        else {
            this.selectedAddress.shippingCharges = 0;
            this.selectedAddress.addlshippingCharges = 0;
            this.selectedAddress.salesTaxPerc = 0;
            this.computeTotals();
        }
    };
    ;
    ApproveOrder.prototype.changeSelectedCard = function () {
        var body = {};
        body.data = JSON.stringify({ sqlKey: 'GetAllPaymentMethods' });
        this.appService.httpGet('get:payment:method', body);
        this.cardModal.open();
    };
    ;
    ApproveOrder.prototype.selectCard = function (card) {
        this.selectedCard = card;
        this.cardModal.close();
    };
    ;
    ApproveOrder.prototype.editWineRequest = function () {
        this.router.navigate(['order']);
        //this.location.back();
    };
    ;
    ApproveOrder.prototype.approve = function () {
        var orderBundle = {};
        var paymentType = this.selectedCard == null ? "Credit Card" : "Pay Later";
        orderBundle.orderMaster = {
            TaxRate: this.selectedAddress.salesTaxPerc / 100,
            PreviousBalance: this.footer.prevBalances.wine,
            Status: "pending",
            ShipName: this.selectedAddress.name,
            ShipCo: this.selectedAddress.co,
            ShipStreet1: this.selectedAddress.street1,
            ShipStreet2: this.selectedAddress.street2,
            ShipCity: this.selectedAddress.city,
            ShipState: this.selectedAddress.state,
            ShipZip: this.selectedAddress.zip,
            ShipCountry: this.selectedAddress.country,
            ShipISOCode: this.selectedAddress.isoCode,
            ShipPhone: this.selectedAddress.phone,
            PaymentType: paymentType,
            CCFirstName: this.selectedCard.ccFirstName,
            CCLastName: this.selectedCard.ccLastName,
            CCType: this.selectedCard.ccType,
            CCNumber: this.selectedCard.ccNumberActual,
            CCExpiryMonth: this.selectedCard.ccExpiryMonth,
            CCExpiryYear: this.selectedCard.ccExpiryYear,
            CCSecurityCode: this.selectedCard.ccSecurityCode,
            BillingName: this.selectedCard.ccFirstName + ' ' + this.selectedCard.ccLastName,
            BillingCo: this.selectedCard.Co,
            BillingStreet1: this.selectedCard.street1,
            BillingStreet2: this.selectedCard.street2,
            BillingCity: this.selectedCard.city,
            BillingState: this.selectedCard.state,
            BillingZip: this.selectedCard.zip,
            BillingCountry: this.selectedCard.country,
            BillingISOCode: this.selectedCard.isoCode,
            DayPhone: this.profile.phone,
            MailName: this.profile.firstName,
            MailCo: this.profile.Co,
            MailStreet1: this.profile.mailingAddress1,
            MailStreet2: this.profile.mailingAddress2,
            MailCity: this.profile.mailingCity,
            MailState: this.profile.mailingState,
            MailZip: this.profile.mailingZip,
            MailCountry: this.profile.mailingCountry,
            MailISOCode: this.profile.mailingISOCode,
            HolidayGift: this.holidaygift
        };
        var master = orderBundle.orderMaster;
        orderBundle.orderMaster.Amount = master.TotalPriceWine + master.TotalPriceAddl + master.SalesTaxWine
            + master.SalesTaxAddl + master.ShippingWine + master.ShippingAddl;
        //to remove zero quantities
        orderBundle.orderDetails = this.orders.filter(function (a) {
            return ((a.orderQty && a.orderQty > 0) || (a.wishList && a.wishList > 0));
        }).map(function (a) {
            return ({
                ProductId: a.id,
                NumOrdered: a.orderQty,
                AdditionalRequested: a.wishList,
                Price: a.price,
                Allocation: a.availableQty,
                SortOrder: 0
            });
        });
        orderBundle.productDetails = this.orders.filter(function (a) {
            return ((a.orderQty && a.orderQty > 0) || (a.wishList && a.wishList > 0));
        }).map(function (a) {
            return ({
                ProductId: a.id,
                NumOrdered: a.orderQty,
                AdditionalRequested: a.wishList,
                Price: a.price,
                Allocation: a.availableQty,
                SortOrder: 0,
                item: a.item,
                descr: a.descr,
                productType: a.productType
            });
        });
        //orderBundle.orderImpDetails = { AddressId: this.selectedAddress.id, CreditCardId: this.selectedCard.id };
        this.appService.httpPost('post:save:approve:request', orderBundle);
    };
    ;
    ApproveOrder.prototype.removePayMethod = function () {
        this.selectedCard = {};
    };
    ;
    ApproveOrder.prototype.computeTotals = function () {
        this.orders = this.appService.request('orders');
        // this.orders = [{ availableQty: 3, id: 1, item: 'test item1', orderQty: 2, packing: 'p', price: 120, wishList: 2 },
        // { availableQty: 3, id: 1, item: 'test item1', orderQty: 22, packing: 'p', price: 125, wishList: 1 },
        // { availableQty: 3, id: 1, item: 'test item2', orderQty: 11, packing: 'p', price: 130, wishList: 2 },
        // { availableQty: 3, id: 1, item: 'test item3', orderQty: 5, packing: 'p', price: 150, wishList: 3 },
        // { availableQty: 3, id: 1, item: 'test item4', orderQty: 2, packing: 'p', price: 130, wishList: 5 },
        // ];        
        //totals
        if (!this.orders) {
            console.log('Order request is not available.');
            return;
        }
        this.footer.wineTotals = this.orders.reduce(function (a, b) {
            return ({
                wine: a.wine + b.price * b.orderQty,
                addl: a.addl + b.price * b.wishList
            });
        }, { wine: 0, addl: 0 });
        //Sales tax
        this.computeSalesTax();
        this.computeShipping();
        //grand totals
        var totWineCost = this.footer.wineTotals.wine / 1 + this.footer.salesTaxTotals.wine / 1 + this.footer.shippingTotals.wine / 1
            + this.footer.prevBalances.wine / 1;
        var totWineaddlCost = this.footer.wineTotals.wine / 1 + this.footer.salesTaxTotals.wine / 1 + this.footer.shippingTotals.wine / 1
            + this.footer.prevBalances.wine / 1;
        this.footer.grandTotals = {
            wine: totWineCost,
            addl: totWineaddlCost
        };
    };
    ;
    ApproveOrder.prototype.computeSalesTax = function () {
        var effectiveSalesTaxPerc = this.selectedAddress.salesTaxPerc;
        /*
        if (effectiveSalesTaxPerc && (effectiveSalesTaxPerc > 0)) {
            this.footer.salesTaxPerc = effectiveSalesTaxPerc;
        } else {
            effectiveSalesTaxPerc = this.selectedAddress.defaultSalesTaxPerc;
            if (effectiveSalesTaxPerc && (effectiveSalesTaxPerc > 0)) {
                this.footer.salesTaxPerc = effectiveSalesTaxPerc;
            } else {
                this.footer.salesTaxPerc = 0.00;
            }
        }
        this.footer.salesTaxTotals = {
            wine: this.footer.wineTotals.wine * this.footer.salesTaxPerc / 100,
            addl: this.footer.wineTotals.addl * this.footer.salesTaxPerc / 100
        }
        */
        this.footer.salesTaxPerc = effectiveSalesTaxPerc;
        this.footer.salesTaxTotals = {
            wine: this.footer.wineTotals.wine * this.footer.salesTaxPerc / 100,
            addl: this.footer.wineTotals.addl * this.footer.salesTaxPerc / 100
        };
    };
    ;
    ApproveOrder.prototype.computeShipping = function () {
        /*let effectiveShipping = this.selectedAddress.shippingCharges;
        if (effectiveShipping && (effectiveShipping > 0)) {
            this.footer.shippingTotals = effectiveShipping;
        } else {
            effectiveShipping = this.selectedAddress.defaultShippingCharges;
            if (effectiveShipping && (effectiveShipping > 0)) {
                this.footer.shippingTotals = { wine: effectiveShipping, addl: effectiveShipping };
            } else {
                this.footer.shippingTotals = { wine: 0.00, addl: 0.00 };
            }
        }*/
        this.footer.shippingTotals = { wine: this.selectedAddress.shippingCharges, addl: this.selectedAddress.addlshippingCharges };
    };
    ;
    ApproveOrder.prototype.ngOnInit = function () {
        this.getArtifact();
        this.appService.httpGet('get:user:profile');
        //this.appService.httpGet('get:approve:artifacts')
    };
    ;
    ApproveOrder.prototype.ngOnDestroy = function () {
        this.approveArtifactsSub.unsubscribe();
        this.allAddrSubscription.unsubscribe();
        this.allCardSubscription.unsubscribe();
    };
    ;
    ApproveOrder.prototype.getArtifact = function () {
        this.orders = this.appService.request('orders');
        //this.holidaygift=this.orders.isholidayGift;
        this.holidaygift = this.appService.request('holidaygift');
        this.shippingBottles = this.orders.reduce(function (a, b, c) {
            return ({
                requestedShippingBottle: a.requestedShippingBottle + b.shippingBottles * b.orderQty,
                additinalShippingBottle: a.additinalShippingBottle + b.shippingBottles * b.wishList,
                totalRequestedBottles: a.totalRequestedBottles + b.orderQty,
                totalWishlistBottles: a.totalWishlistBottles + b.wishList
            });
        }, { requestedShippingBottle: 0, additinalShippingBottle: 0, totalRequestedBottles: 0, totalWishlistBottles: 0 });
        var shippedState = this.selectedAddress.state == undefined ? "" : this.selectedAddress.state;
        var shippedZip = this.selectedAddress.zip == undefined ? "" : this.selectedAddress.zip;
        var body = {};
        body.data = JSON.stringify({ sqlKey: 'GetApproveArtifacts', sqlParms: {
                requestedShippingBottle: this.shippingBottles.requestedShippingBottle,
                additinalShippingBottle: this.shippingBottles.additinalShippingBottle,
                shippingState: shippedState,
                shippingZip: shippedZip
            } });
        this.appService.httpGet('get:approve:artifacts', body);
        //this.appService.httpGet('get:approve:artifacts', body)
        // this.appService.httpGet('get:approve:artifacts')
    };
    ApproveOrder.prototype.getShippingandSalesTax = function () {
        var shippedState = this.selectedAddress.state == undefined ? "" : this.selectedAddress.state;
        var shippedZip = this.selectedAddress.zip == undefined ? "" : this.selectedAddress.zip;
        var body = {};
        body.data = JSON.stringify({ sqlKey: 'GetShippingSalesTaxPerc', sqlParms: {
                requestedShippingBottle: this.shippingBottles.requestedShippingBottle,
                additinalShippingBottle: this.shippingBottles.additinalShippingBottle,
                shippingState: shippedState,
                shippingZip: shippedZip
            } });
        this.appService.httpGet('get:approve:artifacts:ShippingandSalesTax', body);
        //this.appService.httpGet('get:approve:artifacts', body)
        // this.appService.httpGet('get:approve:artifacts')
    };
    return ApproveOrder;
}());
__decorate([
    core_1.ViewChild('addrModal'),
    __metadata("design:type", ng2_modal_1.Modal)
], ApproveOrder.prototype, "addrModal", void 0);
__decorate([
    core_1.ViewChild('cardModal'),
    __metadata("design:type", ng2_modal_1.Modal)
], ApproveOrder.prototype, "cardModal", void 0);
ApproveOrder = __decorate([
    core_1.Component({
        templateUrl: 'app/components/approveOrder/approveOrder.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService, router_1.Router])
], ApproveOrder);
exports.ApproveOrder = ApproveOrder;
//# sourceMappingURL=approveOrder.component.js.map