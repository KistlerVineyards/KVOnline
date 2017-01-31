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
var app_service_1 = require("../../services/app.service");
var ng2_modal_1 = require("ng2-modal");
var OrderHistory = (function () {
    function OrderHistory(appService) {
        var _this = this;
        this.appService = appService;
        this.isDataAvailable = false;
        this.payMethods = [{}];
        this.allAddresses = [{}];
        this.growlMessages = [];
        this.orderDetails = { details: [{}], address: {}, card: {} };
        this.selectedOrder = {};
        this.selectedAddress = {};
        this.selectedCard = {};
        this.shippingBottles = {};
        this.itemsPerPage = 5;
        this.maxSize = 5;
        this.alert = {
            show: false,
            type: 'danger',
            message: this
                .appService
                .getValidationErrorMessage('invalidAddress')
        };
        this.orderDetailsSub = appService.filterOn('get:order:details')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                var tables = JSON.parse(d.data);
                _this.orderDetails.details = tables.Table;
                _this.orderDetails.address = tables.Table1[0];
                _this.orderDetails.card = tables.Table1[0];
                var ord = {};
                _this.shippingBottles.totalRequestedBottles = 0;
                _this.shippingBottles.totalWishlistBottles = 0;
                for (var index in _this.orderDetails.details) {
                    ord = _this.orderDetails.details[index];
                    var item = ord.item;
                    if ((item.indexOf("Package") != -1) || (item.indexOf("package") != -1)) {
                        _this.shippingBottles.totalRequestedBottles = _this.shippingBottles.totalRequestedBottles + ord.orderQty * 6;
                        _this.shippingBottles.totalWishlistBottles = _this.shippingBottles.totalWishlistBottles + ord.wishList * 6;
                    }
                    else if ((item.indexOf("Set") != -1) || (item.indexOf("set") != -1)) {
                        _this.shippingBottles.totalRequestedBottles = _this.shippingBottles.totalRequestedBottles + ord.orderQty * 3;
                        _this.shippingBottles.totalWishlistBottles = _this.shippingBottles.totalWishlistBottles + ord.wishList * 3;
                    }
                    else {
                        _this.shippingBottles.totalRequestedBottles = _this.shippingBottles.totalRequestedBottles + ord.orderQty;
                        _this.shippingBottles.totalWishlistBottles = _this.shippingBottles.totalWishlistBottles + ord.wishList;
                    }
                }
                /*this.shippingBottles = this.orderDetails.details.reduce(function (a, b) {
                return ({
                    if((a.item.indexOf('Package') > 0) || (a.item.indexOf('package') > 0)){
                        totalRequestedBottles: a.totalRequestedBottles + b.orderQty * 6,
                        totalWishlistBottles: a.totalWishlistBottles + b.wishList * 6
                    }
                    else if((a.item.indexOf('Set') > 0)  || (a.item.indexOf('set') > 0)){
                        totalRequestedBottles: a.totalRequestedBottles + b.orderQty * 3,
                        totalWishlistBottles: a.totalWishlistBottles + b.wishList * 3
                    }
                    else{
                        totalRequestedBottles: a.totalRequestedBottles + b.orderQty ,
                        totalWishlistBottles: a.totalWishlistBottles + b.wishList
                    }
                   // totalRequestedBottles: a.totalRequestedBottles + b.NumOrdered
                   // , totalWishlistBottles: a.totalWishlistBottles + b.AdditionalRequested
                        //totalRequestedBottles : a.totalRequestedBottles + (b.orderQty * (b.packing == 's' ? 3 : b.packing == 'p' ? 6 : 1))
                        //,totalWishlistBottles : a.totalWishlistBottles + (b.wishList * (b.packing == 's' ? 3 : b.packing == 'p' ? 6 : 1))
                })
                }, { totalRequestedBottles:0, totalWishlistBottles:0 });*/
                //to escape from null values
                _this.orderDetails.details = _this.orderDetails.details ? _this.orderDetails.details : [{}];
                _this.orderDetails.address = _this.orderDetails.address ? _this.orderDetails.address : {};
                _this.orderDetails.card = _this.orderDetails.card ? _this.orderDetails.card : {};
            }
        });
        this.orderHeaderSub = appService.filterOn('get:order:headers')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                _this.orderHeaders = JSON.parse(d.data).Table;
                _this.pageRows = _this.orderHeaders.slice(0, _this.itemsPerPage);
                if (_this.orderHeaders.length > 0) {
                    var ord = _this.orderHeaders[0];
                    ord.checked = true;
                    _this.showDetails(ord);
                    _this.isDataAvailable = true;
                }
            }
        });
        this.allAddrSubscription = appService
            .filterOn('get:shipping:address')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                _this.allAddresses = JSON
                    .parse(d.data)
                    .Table;
            }
        });
        this.postOrderChangeAddressSub = appService
            .filterOn('post:order:change:shipping:address')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
                appService.showAlert(_this.alert, true, 'dataNotSaved');
            }
            else {
                appService.showAlert(_this.alert, false);
                //this.orderDetails.address = this.selectedAddress;
                _this.showDetails(_this.selectedOrder);
                //this.orderDetails.address.orderImpDetailsId = this.orderImpDetailsId;
                _this.growlMessages = [];
                _this
                    .growlMessages
                    .push({ severity: 'success', summary: 'Success', detail: 'Data saved successfully' });
            }
        });
        this.allCardSubscription = appService
            .filterOn('get:payment:method')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                _this.payMethods = JSON
                    .parse(d.data)
                    .Table;
                _this.payMethods = JSON.parse(d.data).Table.map(function (value, i) {
                    value.ccNumber = "x" + value.ccNumber.substring(value.ccNumber.length - 4, value.ccNumber.length);
                    return (value);
                });
            }
        });
        this.postOrderChangeCardSub = appService
            .filterOn('post:order:change:payment:method')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
                appService.showAlert(_this.alert, true, 'dataNotSaved');
            }
            else {
                appService.showAlert(_this.alert, false);
                //this.orderDetails.card = this.selectedCard;
                _this.showDetails(_this.selectedOrder);
                //this.orderDetails.card.orderImpDetailsId = this.orderImpDetailsId;
                _this.growlMessages = [];
                _this
                    .growlMessages
                    .push({ severity: 'success', summary: 'Success', detail: 'Data saved successfully' });
            }
        });
    }
    OrderHistory.prototype.onPageChange = function (page) {
        var start = (page.page - 1) * page.itemsPerPage;
        var end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : this.orderHeaders.length;
        this.pageRows = this.orderHeaders.slice(start, end);
        if (this.pageRows.length > 0) {
            this.showDetails(this.pageRows[0]);
        }
    };
    ;
    OrderHistory.prototype.showDetails = function (order) {
        this.orderHeaders.map(function (a, b) { a.checked = false; }); //to uncheck all rows
        order.grandTotalWine = order.totalPriceWine / 1 + order.salesTaxWine / 1 + order.shippingWine / 1;
        order.grandTotalAddl = order.totalPriceAddl / 1 + order.salesTaxAddl / 1 + (order.shippingAddl - order.shippingWine) / 1;
        order.checked = true; // to check current row
        this.selectedOrder = order;
        this.appService.httpGet('get:order:details', { id: order.id });
    };
    ;
    OrderHistory.prototype.selectAddress = function (address) {
        this.selectedAddress = address;
        if (this.selectedAddress.state.length > 11) {
            this.selectedAddress.state = this.selectedAddress.state.substring(0, 11);
        }
        //this.orderImpDetailsId = this.orderDetails.address.orderImpDetailsId;
        this
            .appService
            .showAlert(this.alert, false);
        this
            .appService
            .httpPost('post:order:change:shipping:address', {
            sqlKey: 'UpdateOrderShippingAddress',
            sqlParms: {
                name: this.selectedAddress.name,
                co: this.selectedAddress.co ? this.selectedAddress.co : '',
                street1: this.selectedAddress.street1,
                street2: this.selectedAddress.street2 ? this.selectedAddress.street2 : '',
                city: this.selectedAddress.city,
                state: this.selectedAddress.state,
                zip: this.selectedAddress.zip,
                phone: this.selectedAddress.phone,
                isoCode: this.selectedAddress.isoCode,
                country: this.selectedAddress.country,
                orderId: this.selectedOrder.id,
            }
        });
        this.addrModal.close();
    };
    OrderHistory.prototype.changeAddress = function () {
        this
            .appService
            .httpGet('get:shipping:address');
        this
            .addrModal
            .open();
    };
    OrderHistory.prototype.changePaymentMethod = function () {
        var body = {};
        body.data = JSON.stringify({ sqlKey: 'GetAllPaymentMethods' });
        this
            .appService
            .httpGet('get:payment:method', body);
        this
            .cardModal
            .open();
    };
    OrderHistory.prototype.selectCard = function (card) {
        this.selectedCard = card;
        if (this.selectedCard.state.length > 11) {
            this.selectedCard.state = this.selectedCard.state.substring(0, 11);
        }
        //this.orderImpDetailsId = this.orderDetails.card.orderImpDetailsId;
        this
            .appService
            .showAlert(this.alert, false);
        this
            .appService
            .httpPost('post:order:change:payment:method', {
            sqlKey: 'UpdateOrderPaymentMethod',
            sqlParms: {
                ccFirstName: this.selectedCard.ccFirstName,
                ccLastName: this.selectedCard.ccLastName,
                ccType: this.selectedCard.ccType,
                ccNumber: this.selectedCard.ccNumber,
                ccExpiryMonth: this.selectedCard.ccExpiryMonth,
                ccExpiryYear: this.selectedCard.ccExpiryYear,
                ccSecurityCode: this.selectedCard.ccSecurityCode,
                name: this.selectedCard.Name,
                //co:  this.selectedCard.co,
                street1: this.selectedCard.street1,
                street2: this.selectedCard.street2 ? this.selectedCard.street2 : '',
                city: this.selectedCard.city,
                state: this.selectedCard.state,
                zip: this.selectedCard.zip,
                phone: this.selectedCard.phone,
                isoCode: this.selectedCard.isoCode,
                country: this.selectedCard.country,
                paymentType: "Credit Card",
                billid: this.selectedCard.id,
                orderId: this.selectedOrder.id
            }
        });
        this
            .cardModal
            .close();
    };
    OrderHistory.prototype.ngOnInit = function () {
        this.appService.httpGet('get:order:headers');
    };
    ;
    OrderHistory.prototype.ngOnDestroy = function () {
        this.orderHeaderSub.unsubscribe();
        this.orderDetailsSub.unsubscribe();
        this.allAddrSubscription.unsubscribe();
        this.postOrderChangeAddressSub.unsubscribe();
        this.allCardSubscription.unsubscribe();
        this.postOrderChangeCardSub.unsubscribe();
    };
    ;
    return OrderHistory;
}());
__decorate([
    core_1.ViewChild('addrModal'),
    __metadata("design:type", ng2_modal_1.Modal)
], OrderHistory.prototype, "addrModal", void 0);
__decorate([
    core_1.ViewChild('cardModal'),
    __metadata("design:type", ng2_modal_1.Modal)
], OrderHistory.prototype, "cardModal", void 0);
OrderHistory = __decorate([
    core_1.Component({
        templateUrl: 'app/components/orderHistory/orderHistory.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService])
], OrderHistory);
exports.OrderHistory = OrderHistory;
//# sourceMappingURL=orderHistory.component.js.map