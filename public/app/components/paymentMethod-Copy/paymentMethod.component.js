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
var PaymentMethod = (function () {
    function PaymentMethod(appService) {
        var _this = this;
        this.appService = appService;
        this.getSubscription = appService.filterOn("get:credit:card")
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d);
            }
            else {
                _this.cards = JSON.parse(d.data).Table;
            }
        });
        this.postSubscription = appService.filterOn("insert:credit:card")
            .subscribe(function (d) {
            if (d.data.error) {
                console.log(d);
            }
            else {
                _this.cards[0].id = d.data.result.result;
                d.body.card.isNew = false;
            }
        });
        this.deleteSubscription = appService.filterOn("delete:credit:card")
            .subscribe(function (d) {
            if (d.data.error) {
                console.log("Error occured");
            }
            else {
                _this.cards.splice(d.index, 1);
            }
        });
        this.setDefaultCardSubscription = appService.filterOn("set:default:card")
            .subscribe(function (d) {
            if (d.data.error) {
                console.log("Error occured");
            }
            else {
                console.log(d);
            }
        });
    }
    ;
    PaymentMethod.prototype.addCard = function () {
        var card = { cardName: '', cardNumber: '', isNew: false };
        card.isNew = true;
        this.cards.unshift(card);
    };
    ;
    PaymentMethod.prototype.removeNew = function (index) {
        this.cards.splice(index, 1);
    };
    ;
    PaymentMethod.prototype.remove = function (card, index) {
        //let token = this.appService.getToken();
        this.appService.httpDelete('delete:credit:card', { id: card.id, index: index });
    };
    ;
    PaymentMethod.prototype.save = function (card) {
        this.appService.httpPost('insert:credit:card', { card: card });
    };
    ;
    PaymentMethod.prototype.setDefault = function (card) {
        this.appService.httpPost('set:default:card', { id: card.id });
    };
    PaymentMethod.prototype.ngOnInit = function () {
        var token = this.appService.getToken();
        this.appService.httpGet('get:credit:card', { token: token });
    };
    PaymentMethod.prototype.ngOnDestroy = function () {
        this.getSubscription.unsubscribe();
        this.postSubscription.unsubscribe();
        this.setDefaultCardSubscription.unsubscribe();
    };
    ;
    return PaymentMethod;
}());
PaymentMethod = __decorate([
    core_1.Component({
        templateUrl: 'app/components/paymentMethod/paymentMethod.component.html'
    }),
    __metadata("design:paramtypes", [app_service_1.AppService])
], PaymentMethod);
exports.PaymentMethod = PaymentMethod;
//# sourceMappingURL=paymentMethod.component.js.map