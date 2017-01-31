import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { PaginationModule } from 'ng2-bootstrap/components/Pagination';
import { AppService } from '../../services/app.service';
import {ModalModule, Modal} from "ng2-modal";
import {AlertModule} from 'ng2-bootstrap/components/alert';
import {GrowlModule} from 'primeng/components/growl/growl';

@Component({
    templateUrl: 'app/components/orderHistory/orderHistory.component.html'
})
export class OrderHistory {
    isDataAvailable: boolean = false;
    orderHeaderSub: Subscription;
    orderDetailsSub: Subscription;
    allAddrSubscription : Subscription;
    postOrderChangeAddressSub : Subscription;
    allCardSubscription : Subscription;
    postOrderChangeCardSub : Subscription;
    payMethods : any = [{}];
    allAddresses : any = [{}];
    growlMessages : any = [];
    orderHeaders: [{}];
    orderDetails: any = { details: [{}], address: {}, card: {} };
    selectedOrder: any = {};
    selectedAddress : any = {};
    selectedCard : any = {};
    shippingBottles:any={};
    //Pagination
    pageRows: any;
    itemsPerPage: number = 5;
    maxSize: number = 5;
    alert : any = {
        show: false,
        type: 'danger',
        message: this
            .appService
            .getValidationErrorMessage('invalidAddress')
    };
    onPageChange(page: any) {
        let start = (page.page - 1) * page.itemsPerPage;
        let end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : this.orderHeaders.length;
        this.pageRows = this.orderHeaders.slice(start, end);
        if (this.pageRows.length > 0) {
            this.showDetails(this.pageRows[0]);
        }
    }
    constructor(private appService: AppService) {
        this.orderDetailsSub = appService.filterOn('get:order:details')
            .subscribe(d => {
                if (d.data.error) {
                    console.log(d.data.error);
                } else {
		    let tables = JSON.parse(d.data);
                    this.orderDetails.details = tables.Table;
                    this.orderDetails.address = tables.Table1[0];
                    this.orderDetails.card = tables.Table1[0];
                    let ord :any={};
                    this.shippingBottles.totalRequestedBottles = 0;
                    this.shippingBottles.totalWishlistBottles = 0
                    for( var index in this.orderDetails.details)
                    {
                        ord = this.orderDetails.details[index];
                        let item = ord.item;
                        if((item.indexOf("Package") !=-1) || (item.indexOf("package") !=-1)){
                            this.shippingBottles.totalRequestedBottles = this.shippingBottles.totalRequestedBottles + ord.orderQty * 6;
                            this.shippingBottles.totalWishlistBottles = this.shippingBottles.totalWishlistBottles + ord.wishList * 6;
                        }
                        else if((item.indexOf("Set") !=-1)  || (item.indexOf("set") !=-1)){
                            this.shippingBottles.totalRequestedBottles= this.shippingBottles.totalRequestedBottles + ord.orderQty * 3;
                            this.shippingBottles.totalWishlistBottles= this.shippingBottles.totalWishlistBottles + ord.wishList * 3;
                        }
                        else{
                            this.shippingBottles.totalRequestedBottles= this.shippingBottles.totalRequestedBottles + ord.orderQty;
                            this.shippingBottles.totalWishlistBottles= this.shippingBottles.totalWishlistBottles + ord.wishList;
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
                    this.orderDetails.details = this.orderDetails.details ? this.orderDetails.details : [{}];
                    this.orderDetails.address = this.orderDetails.address ? this.orderDetails.address : {};
                    this.orderDetails.card = this.orderDetails.card ? this.orderDetails.card : {};
                }
            });
        this.orderHeaderSub = appService.filterOn('get:order:headers')
            .subscribe(d => {
                if (d.data.error) {
                    console.log(d.data.error);
                } else {
                    this.orderHeaders = JSON.parse(d.data).Table;
                    this.pageRows = this.orderHeaders.slice(0, this.itemsPerPage);
                    if (this.orderHeaders.length > 0) {
                        let ord: any = this.orderHeaders[0];
                        ord.checked = true;
                        this.showDetails(ord);
                        this.isDataAvailable = true;
                    }
                }
            });
            this.allAddrSubscription = appService
            .filterOn('get:shipping:address')
            .subscribe(d => {
                if (d.data.error) {
                    console.log(d.data.error);
                } else {
                    this.allAddresses = JSON
                        .parse(d.data)
                        .Table;
                }
            });
            this.postOrderChangeAddressSub = appService
            .filterOn('post:order:change:shipping:address')
            .subscribe(d => {
                if (d.data.error) {
                    console.log(d.data.error);
                    appService.showAlert(this.alert, true, 'dataNotSaved');
                } else {
                    appService.showAlert(this.alert, false);
                    //this.orderDetails.address = this.selectedAddress;
                    this.showDetails(this.selectedOrder);
                    //this.orderDetails.address.orderImpDetailsId = this.orderImpDetailsId;
                    this.growlMessages = [];
                    this
                        .growlMessages
                        .push({severity: 'success', summary: 'Success', detail: 'Data saved successfully'});
                }
            });
        this.allCardSubscription = appService
            .filterOn('get:payment:method')
            .subscribe(d => {
                if (d.data.error) {
                    console.log(d.data.error);
                } else {
                    this.payMethods = JSON
                        .parse(d.data)
                        .Table;
                    this.payMethods = JSON.parse(d.data).Table.map(function (value, i) {
                    value.ccNumber ="x" + value.ccNumber.substring(value.ccNumber.length -4, value.ccNumber.length)
                    return (value);
                    });
                }
            });
        this.postOrderChangeCardSub = appService
            .filterOn('post:order:change:payment:method')
            .subscribe(d => {
                if (d.data.error) {
                    console.log(d.data.error);
                    appService.showAlert(this.alert, true, 'dataNotSaved');
                } else {
                    appService.showAlert(this.alert, false);
                    //this.orderDetails.card = this.selectedCard;
                    this.showDetails(this.selectedOrder);
                    //this.orderDetails.card.orderImpDetailsId = this.orderImpDetailsId;
                    this.growlMessages = [];
                    this
                        .growlMessages
                        .push({severity: 'success', summary: 'Success', detail: 'Data saved successfully'});
                }
            });
    };
    showDetails(order) {
        this.orderHeaders.map((a: any, b) => { a.checked = false; });//to uncheck all rows
        order.grandTotalWine = order.totalPriceWine / 1 + order.salesTaxWine / 1 + order.shippingWine / 1;
        order.grandTotalAddl = order.totalPriceAddl / 1 + order.salesTaxAddl / 1 + (order.shippingAddl - order.shippingWine) / 1;
        order.checked = true; // to check current row
        this.selectedOrder = order;
        this.appService.httpGet('get:order:details', { id: order.id })
    };
    selectAddress(address) {
        this.selectedAddress = address;
        if(this.selectedAddress.state.length > 11)
        {
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
                    co:  this.selectedAddress.co ? this.selectedAddress.co : '',
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
    }

    @ViewChild('addrModal')addrModal : Modal;
    changeAddress() {
        this
            .appService
            .httpGet('get:shipping:address');
        this
            .addrModal
            .open();
    }

    @ViewChild('cardModal')cardModal : Modal;
    changePaymentMethod() {
        let body : any = {};
        body.data = JSON.stringify({sqlKey: 'GetAllPaymentMethods'});
        this
            .appService
            .httpGet('get:payment:method', body);
        this
            .cardModal
            .open();
    }
    selectCard(card) {
        this.selectedCard = card;
        if(this.selectedCard.state.length > 11)
        {
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
    }    
    ngOnInit() {
        this.appService.httpGet('get:order:headers')
    };
    ngOnDestroy() {
        this.orderHeaderSub.unsubscribe();
        this.orderDetailsSub.unsubscribe();
        this.allAddrSubscription.unsubscribe();
        this.postOrderChangeAddressSub.unsubscribe();
        this.allCardSubscription.unsubscribe();
        this.postOrderChangeCardSub.unsubscribe();
    };
}