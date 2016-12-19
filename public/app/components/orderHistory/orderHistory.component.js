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
var OrderHistory = (function () {
    function OrderHistory(appService) {
        var _this = this;
        this.appService = appService;
        this.isDataAvailable = false;
        this.orderDetails = { details: [{}], address: {}, card: {} };
        this.selectedOrder = {};
        this.itemsPerPage = 5;
        this.maxSize = 5;
        this.orderDetailsSub = appService.filterOn('get:order:details')
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d.data.error);
            }
            else {
                _this.orderDetails.details = JSON.parse(d.data).Table;
                _this.orderDetails.address = JSON.parse(d.data).Table1[0];
                _this.orderDetails.card = JSON.parse(d.data).Table1[0];
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
        order.grandTotalAddl = order.totalPriceAddl / 1 + order.salesTaxAddl / 1 + order.shippingAddl / 1;
        order.checked = true; // to check current row
        this.selectedOrder = order;
        this.appService.httpGet('get:order:details', { id: order.id });
    };
    ;
    OrderHistory.prototype.ngOnInit = function () {
        this.appService.httpGet('get:order:headers');
    };
    ;
    OrderHistory.prototype.ngOnDestroy = function () {
        this.orderHeaderSub.unsubscribe();
        this.orderDetailsSub.unsubscribe();
    };
    ;
    return OrderHistory;
}());
OrderHistory = __decorate([
    core_1.Component({
        templateUrl: 'app/components/orderHistory/orderHistory.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService])
], OrderHistory);
exports.OrderHistory = OrderHistory;
//# sourceMappingURL=orderHistory.component.js.map