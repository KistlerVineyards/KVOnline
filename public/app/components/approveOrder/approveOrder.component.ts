import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Location } from '@angular/common';
import { AppService } from '../../services/app.service';
import { Router } from '@angular/router';
import { messages } from '../../config';
import { ModalModule, Modal } from "ng2-modal";
//import { AlertModule } from 'ng2-bootstrap';
@Component({
    templateUrl: 'app/components/approveOrder/approveOrder.component.html'
})
export class ApproveOrder {
    approveArtifactsSub: Subscription;
    postApproveSubscription: Subscription;
    shippingandSalesTaxSub:Subscription;
    getProfileSubscription: Subscription;
    selectedAddress: any = {};
    selectedCard: any = {};
    allTotals: {} = {};
    footer: any = {
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
    allAddrSubscription: Subscription;
    allCardSubscription: Subscription;

    approveHeading: string = messages['mess:approve:heading'];

    allAddresses: [any] = [{}];
    // allCards: [any] = [{}];
    payMethods:[any]=[{}];
    orders: any[];
    holidaygift:boolean = false;
    isChangeAddress:boolean=false;
    shippingBottles:any={};
    //orderBundle: any = {};
    profile: any = {};
    isApproveButtonDisabled:boolean = true;
    constructor(private appService: AppService, private location: Location, private router: Router) {
        let ords = appService.request('orders');
        if (!ords) {
            router.navigate(['order']);
        }
        this.getProfileSubscription = appService.filterOn('get:user:profile')
            .subscribe(d => {
                if (d.data.error) {
                    console.log(d.data.error);
                } else {
                    let profileArray = JSON.parse(d.data).Table;
                    if (profileArray.length > 0) {
                        this.profile = profileArray[0];
                        //this.selectedCountryName = profileArray[0].mailingCountry
                    }
                }
            });
        this.postApproveSubscription = appService.filterOn('post:save:approve:request').subscribe(d => {
            if (d.data.error) {
                console.log(d.data.error);
            } else {
                this.appService.reset('orders');
                this.router.navigate(['receipt']);
            }
        });
        this.approveArtifactsSub = appService.filterOn('get:approve:artifacts').subscribe(d => {
            if (d.data.error) {
                console.log(d.data.error);
            } else {
                let artifacts = JSON.parse(d.data);
                if (artifacts.Table.length > 0) {
                    this.selectedCard = artifacts.Table[0];
                } else {
                    this.selectedCard = {};
                }
                if (artifacts.Table1.length > 0) {
                    if(!this.isChangeAddress){
                        this.selectedAddress = artifacts.Table1[0];
                        this.selectedAddress.salesTaxPerc=this.selectedAddress.isoCode !="US" ? 0 : this.selectedAddress.salesTaxPerc;
                        this.selectedAddress.shippingCharges=this.selectedAddress.isoCode !="US" ? 0 : this.selectedAddress.shippingCharges;
                        this.selectedAddress.addlshippingCharges=this.selectedAddress.isoCode !="US" ? 0 : this.selectedAddress.addlshippingCharges;
                        this.isApproveButtonDisabled=false;
                    }
                } else {
                    //this.selectedAddress = null;
                    this.selectedAddress.salesTaxPerc=0;
                    this.selectedAddress.shippingCharges=0;
                    this.selectedAddress.addlshippingCharges=0;
                    this.isApproveButtonDisabled=true;

                }
                if (artifacts.Table2.length > 0) {
                    this.footer.prevBalance = artifacts.Table2[0] / 1;
                    this.footer.prevBalances = { wine: artifacts.Table2[0].prevBalanceWine, addl: artifacts.Table2[0].prevBalanceAddl }
                } else {
                    this.footer.prevBalances = { wine: 0.00, addl: 0.00 };
                }
            }
            this.computeTotals();
        });
        this.allAddrSubscription = appService.filterOn('get:shipping:address').subscribe(d => {
            if (d.data.error) {
                console.log(d.data.error);
            } else {
                this.allAddresses = JSON.parse(d.data).Table;
            }
        });
        this.allCardSubscription = appService.filterOn('get:payment:method').subscribe(d => {
            if (d.data.error) {
                console.log(d.data.error);
            } else {
                this.payMethods = JSON.parse(d.data).Table;
            }
        });
        this.shippingandSalesTaxSub=appService.filterOn('get:approve:artifacts:ShippingandSalesTax').subscribe(d => {
            if (d.data.error) {
                console.log(d.data.error);
            } else {
                var shippingandSaletax=JSON.parse(d.data).Table;                
                if(shippingandSaletax.length == 2){
                    this.selectedAddress.shippingCharges=shippingandSaletax[0].ShipPrice;
                    this.selectedAddress.addlshippingCharges=shippingandSaletax[1].ShipPrice;
                    this.selectedAddress.salesTaxPerc=shippingandSaletax[0].SalesTaxRate;
                }  
                else
                {
                    this.selectedAddress.shippingCharges=shippingandSaletax[0].ShipPrice;
                    this.selectedAddress.salesTaxPerc=shippingandSaletax[0].SalesTaxRate;
                    if(this.shippingBottles.requestedShippingBottle == this.shippingBottles.additinalShippingBottle){
                        this.selectedAddress.addlshippingCharges=shippingandSaletax[0].ShipPrice;
                    }
                    else
                    {
                        this.selectedAddress.addlshippingCharges=0;
                    }
                }
            }
        this.computeTotals();
        });

    };
    @ViewChild('addrModal') addrModal: Modal;
    changeSelectedAddress() {
        this.isChangeAddress=true;
        this.appService.httpGet('get:shipping:address');
        this.addrModal.open();
    };
    selectAddress(address) {
        this.selectedAddress = address;
        this.addrModal.close();
        if(this.selectedAddress.isoCode =="US")
        {
            this.getShippingandSalesTax();
        }
        else
        {
            this.selectedAddress.shippingCharges=0;
            this.selectedAddress.addlshippingCharges=0;
            this.selectedAddress.salesTaxPerc=0;
            this.computeTotals();
        }
        this.isApproveButtonDisabled=false;
    };

    @ViewChild('cardModal') cardModal: Modal;
    changeSelectedCard() {
        let body: any = {};
        body.data = JSON.stringify({ sqlKey: 'GetAllPaymentMethods' });
        this.appService.httpGet('get:payment:method', body);
        this.cardModal.open();
    };
    selectCard(card) {
        this.selectedCard = card;
        this.cardModal.close();
    };

    editWineRequest() {
        this.router.navigate(['order']);
        //this.location.back();
    };
    approve() {
        let orderBundle: any = {};
        let paymentType = this.selectedCard == null ? "Credit Card" : "Pay Later";
        orderBundle.orderMaster = {
            TaxRate:this.selectedAddress.salesTaxPerc/100,
            PreviousBalance:this.footer.prevBalances.wine,
            Status:"pending",
            ShipName: this.selectedAddress.name,
            ShipCo:this.selectedAddress.co,
            ShipStreet1: this.selectedAddress.street1,
            ShipStreet2:this.selectedAddress.street2,
            ShipCity: this.selectedAddress.city,
            ShipState: this.selectedAddress.state,
            ShipZip:this.selectedAddress.zip,
            ShipCountry: this.selectedAddress.country,
            ShipISOCode:this.selectedAddress.isoCode,
            ShipPhone: this.selectedAddress.phone,
            PaymentType: paymentType,
            CCFirstName:this.selectedCard.ccFirstName,
            CCLastName: this.selectedCard.ccLastName,
            CCType:this.selectedCard.ccType,
            CCNumber: this.selectedCard.ccNumberActual,
            CCExpiryMonth:this.selectedCard.ccExpiryMonth,
            CCExpiryYear: this.selectedCard.ccExpiryYear,
            CCSecurityCode:this.selectedCard.ccSecurityCode,
            BillingName: this.selectedCard.Name,
            BillingCo:this.selectedCard.Co,
            BillingStreet1: this.selectedCard.street1,
            BillingStreet2:this.selectedCard.street2,
            BillingCity: this.selectedCard.city,
            BillingState: this.selectedCard.state,
            BillingZip:this.selectedCard.zip,
            BillingCountry: this.selectedCard.country,
            BillingISOCode:this.selectedCard.isoCode,
            DayPhone: this.selectedCard.phone,
            MailName: this.profile.firstName,
            MailCo:this.profile.Co,
            MailStreet1: this.profile.mailingAddress1,
            MailStreet2:this.profile.mailingAddress2,
            MailCity: this.profile.mailingCity,
            MailState: this.profile.mailingState,
            MailZip:this.profile.mailingZip,
            MailCountry: this.profile.mailingCountry,
            MailISOCode:this.profile.mailingISOCode,
            HolidayGift:this.holidaygift
        };
        let master = orderBundle.orderMaster;
        orderBundle.orderMaster.Amount = master.TotalPriceWine + master.TotalPriceAddl + master.SalesTaxWine
            + master.SalesTaxAddl + master.ShippingWine + master.ShippingAddl;
        //to remove zero quantities
        orderBundle.orderDetails = this.orders.filter((a) => {
            return ((a.orderQty && a.orderQty > 0) || (a.wishList && a.wishList > 0));
        }).map(
            (a) => {
                return (
                    {
                        ProductId: a.id
                        , NumOrdered: a.orderQty
                        , AdditionalRequested: a.wishList
                        , Price: a.price
                        ,Allocation: a.availableQty
                        ,SortOrder:0
                    });
            });       
        //orderBundle.orderImpDetails = { AddressId: this.selectedAddress.id, CreditCardId: this.selectedCard.id };
        this.appService.httpPost('post:save:approve:request', orderBundle);
    };

    removePayMethod(){
        this.selectedCard={};
    };

    computeTotals() {
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
                wine: a.wine + b.price * b.orderQty
                , addl: a.addl + b.price * b.wishList
            })
        }, { wine: 0, addl: 0 });

        //Sales tax
        this.computeSalesTax();
        this.computeShipping();

        //grand totals
          let totWineCost = this.footer.wineTotals.wine/1 + this.footer.salesTaxTotals.wine/1 + this.footer.shippingTotals.wine/1
            + this.footer.prevBalances.wine/1;
          let totWineaddlCost = this.footer.wineTotals.wine/1 + this.footer.salesTaxTotals.wine/1 + this.footer.shippingTotals.wine/1
            + this.footer.prevBalances.wine/1;
         this.footer.grandTotals = {
            wine: totWineCost
            , addl: totWineaddlCost
        };
    };

    computeSalesTax() {
        let effectiveSalesTaxPerc = this.selectedAddress.salesTaxPerc;   
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
        this.footer.salesTaxPerc=effectiveSalesTaxPerc;
        this.footer.salesTaxTotals = {
            wine: this.footer.wineTotals.wine * this.footer.salesTaxPerc / 100,
            addl: this.footer.wineTotals.addl * this.footer.salesTaxPerc / 100
        }
    };

    computeShipping() {
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
    ngOnInit() {
        this.getArtifact();
        this.appService.httpGet('get:user:profile');
        //this.appService.httpGet('get:approve:artifacts')
    };
    ngOnDestroy() {
        this.approveArtifactsSub.unsubscribe();
        this.allAddrSubscription.unsubscribe();
        this.allCardSubscription.unsubscribe();
        
    };
    getArtifact(){
       this.orders = this.appService.request('orders');
       //this.holidaygift=this.orders.isholidayGift;
       this.holidaygift=this.appService.request('holidaygift');
       this.shippingBottles = this.orders.reduce(function (a, b, c) {
            return ({
                requestedShippingBottle: a.requestedShippingBottle + b.shippingBottles * b.orderQty
                , additinalShippingBottle: a.additinalShippingBottle + b.shippingBottles * b.wishList
            })
        }, { requestedShippingBottle: 0, additinalShippingBottle: 0 });
        
        var shippedState = this.selectedAddress.state == undefined ? "" : this.selectedAddress.state;
        var shippedZip=this.selectedAddress.zip == undefined ? "" : this.selectedAddress.zip;
        

        let body:any={};
        body.data = JSON.stringify({sqlKey:'GetApproveArtifacts', sqlParms:{ 
            requestedShippingBottle: this.shippingBottles.requestedShippingBottle,
            additinalShippingBottle: this.shippingBottles.additinalShippingBottle,
            shippingState:shippedState,
            shippingZip:shippedZip
        }});
        this.appService.httpGet('get:approve:artifacts',body);
        //this.appService.httpGet('get:approve:artifacts', body)
       // this.appService.httpGet('get:approve:artifacts')
   }
   getShippingandSalesTax(){
        var shippedState = this.selectedAddress.state == undefined ? "" : this.selectedAddress.state;
        var shippedZip=this.selectedAddress.zip == undefined ? "" : this.selectedAddress.zip;
        

        let body:any={};
        body.data = JSON.stringify({sqlKey:'GetShippingSalesTaxPerc', sqlParms:{ 
            requestedShippingBottle: this.shippingBottles.requestedShippingBottle,
            additinalShippingBottle: this.shippingBottles.additinalShippingBottle,
            shippingState:shippedState,
            shippingZip:shippedZip
        }});
        this.appService.httpGet('get:approve:artifacts:ShippingandSalesTax',body);
        //this.appService.httpGet('get:approve:artifacts', body)
       // this.appService.httpGet('get:approve:artifacts')
   }
}