import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { AppService } from '../../services/app.service';
import { Util } from '../../services/util';
import { Router } from '@angular/router';
import { messages } from '../../config';
import { ModalModule, Modal } from "ng2-modal";
import { AlertModule } from 'ng2-bootstrap/components/alert';
import { PaymentMethodForm } from '../../components/paymentMethodForm/paymentMethodForm.component';
import {uiText} from '../../config';
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
    defaultCard: any = {};
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
    selectNewCardSub: Subscription;
    allCardSubscription: Subscription;

    approveHeading: string = messages['mess:approve:heading'];

    allAddresses: [any] = [{}];
    // allCards: [any] = [{}];
    payMethods:[any]=[{}];
    orders: any[];
    newCard: any = {};
    ccNumberOrig: string = '';
    holidaygift:boolean = false;
    isChangeAddress:boolean=false;
    isPaymentOptionSelected:boolean=false;
    isExistingPaymentMethodavailable:boolean=false;
    specialInstructions: string='';
    shippingBottles:any={};
    //orderBundle: any = {};
    profile: any = {};
    isAlert: boolean;
    alert: any = { type: "success" };
    sameNofBottles : boolean =false;
    otherOptions:string=uiText.otherOptions
    payLater: any = () => {
        if (!this.selectedCard || Object.keys(this.selectedCard).length == 0) {
            return ('Pay later');
        } else {
            return ('');
        }
    };
    @ViewChild('payMethodModal') payMethodModal: Modal;
    useNewCard() {
        let body: any = {};
        body.data = JSON.stringify({ sqlKey: 'GetDefaultBillingAddressForCard' });
        this.appService.httpGet('get:default:billing:address', body);
        this.payMethodModal.open();
    };

    resetNewCard() {
        //this.payMethodModal.dismiss();
    }    
    constructor(private appService: AppService, private router: Router) {
        let ords = appService.request('orders');
        if (!ords) {
            this.router.navigate(['order']);
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
                this.appService.reset('holidaygift');
                this.router.navigate(['receipt']);
            }
        });
        this.approveArtifactsSub = appService.filterOn('get:approve:artifacts').subscribe(d => {
            if (d.data.error) {
                console.log(d.data.error);
            } else {
                let artifacts = JSON.parse(d.data);
                if (artifacts.Table.length > 0) {
                    this.isPaymentOptionSelected=true;
                    this.isExistingPaymentMethodavailable=true;
                    this.selectedCard = this.defaultCard = artifacts.Table[0];
                    this.selectedCard.ccNumber = "x" + this.selectedCard.ccNumber.substring(this.selectedCard.ccNumber.length -4, this.selectedCard.ccNumber.length);
                    this.selectedCard.isEncryptionRequired=false;
                } else {
                    this.isPaymentOptionSelected=false;
                    this.isExistingPaymentMethodavailable=false;
                    this.selectedCard = {};
                }
                if (artifacts.Table1.length > 0) {
                    if(!this.isChangeAddress){
                        this.selectedAddress = artifacts.Table1[0];
                        this.selectedAddress.salesTaxPerc=this.selectedAddress.isoCode !="US" ? 0 : this.selectedAddress.salesTaxPerc;
                        this.selectedAddress.shippingCharges=this.selectedAddress.isoCode !="US" ? 0 : this.selectedAddress.shippingCharges;
                        this.selectedAddress.addlshippingCharges=this.selectedAddress.isoCode !="US" ? 0 : this.selectedAddress.addlshippingCharges;
                    }
                } else {
                    this.selectedAddress = {};
                    this.selectedAddress.salesTaxPerc=0;
                    this.selectedAddress.shippingCharges=0;
                    this.selectedAddress.addlshippingCharges=0;

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
        this.selectNewCardSub = this.appService.filterOn('select:new:card').subscribe(d => {
            this.newCard = d.data || {};
            this.selectedCard = this.newCard;
            this.ccNumberOrig = this.selectedCard.ccNumber;
            this.selectedCard.ccNumber = Util.getMaskedCCNumber(this.selectedCard.ccNumber);
            this.selectedCard.ccNumber = "x" + this.selectedCard.ccNumber.substring(this.selectedCard.ccNumber.length -4, this.selectedCard.ccNumber.length);

            this.selectedCard.ccNumberActual = this.selectedCard.ccNumber;
            this.selectedCard.encryptedCCNumber = this.ccNumberOrig; 
            this.isPaymentOptionSelected=true;
            if (this.newCard.isSaveForLaterUse) {
                this.isExistingPaymentMethodavailable=true;
            }
            this.selectedCard.isEncryptionRequired = true;
            this.payMethodModal.close();
        });        
        this.allCardSubscription = appService.filterOn('get:payment:method').subscribe(d => {
            if (d.data.error) {
                console.log(d.data.error);
            } else {
                this.payMethods = JSON.parse(d.data).Table;
                this.payMethods = JSON.parse(d.data).Table.map(function (value, i) {
                value.ccNumber ="x" + value.ccNumber.substring(value.ccNumber.length -4, value.ccNumber.length)
                return (value);
                });
            }
        });
        this.shippingandSalesTaxSub=appService.filterOn('get:approve:artifacts:ShippingandSalesTax').subscribe(d => {
            if (d.data.error) {
                console.log(d.data.error);
            } else {
                var shippingandSaletax=JSON.parse(d.data).Table;                
                if(shippingandSaletax.length > 0){
                    this.selectedAddress.shippingCharges=shippingandSaletax[0].ShipPrice;
                    this.selectedAddress.addlshippingCharges=shippingandSaletax[0].addlShipPrice;
                    this.selectedAddress.salesTaxPerc=shippingandSaletax[0].SalesTaxRate;
                }
                /*if(shippingandSaletax.length == 2){
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
                */
            }
        this.computeTotals();
        });

    };
    @ViewChild('addrModal') addrModal: Modal;
    changeSelectedAddress() {
        this.isAlert = false;
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
        this.selectedCard.ccNumber = "x" + this.selectedCard.ccNumber.substring(this.selectedCard.ccNumber.length -4, this.selectedCard.ccNumber.length)
        this.selectedCard.isEncryptionRequired=false;
        this.cardModal.close();
    };

    editWineRequest() {
        this.router.navigate(['order']);
        //this.location.back();
    };
    approve() {
        let orderBundle: any = {};
        let paymentType = this.selectedCard.encryptedCCNumber != null ? "Credit Card" : "Pay Later";
        let billingName = this.selectedCard.ccFirstName + ' ' + this.selectedCard.ccLastName;
        if(paymentType == "Pay Later"){
            billingName = "";
        }
        orderBundle.orderMaster = {
            TaxRate:this.selectedAddress.salesTaxPerc/100,
            PreviousBalance:this.footer.prevBalances.wine,
            Status:"submitted",
            ShipName: this.selectedAddress.name,
            ShipCo:this.selectedAddress.co ? this.selectedAddress.co :'',
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
            EncryptedCCNumber: this.selectedCard.encryptedCCNumber,
            CCExpiryMonth: this.selectedCard.ccExpiryMonth,
            CCExpiryYear: this.selectedCard.ccExpiryYear,
            CCSecurityCode:this.selectedCard.ccSecurityCode,
            BillingName: billingName,
            BillingCo:this.selectedCard.co ? this.selectedCard.co :'',
            BillingStreet1: this.selectedCard.street1,
            BillingStreet2:this.selectedCard.street2,
            BillingCity: this.selectedCard.city,
            BillingState: this.selectedCard.state,
            BillingZip:this.selectedCard.zip,
            BillingCountry: this.selectedCard.country,
            BillingISOCode:this.selectedCard.isoCode,
            DayPhone: this.profile.phone,
            MailName: this.profile.firstName,
            MailCo:this.profile.Co ? this.profile.Co : '',
            MailStreet1: this.profile.mailingAddress1,
            MailStreet2:this.profile.mailingAddress2,
            MailCity: this.profile.mailingCity,
            MailState: this.profile.mailingState,
            MailZip:this.profile.mailingZip,
            MailCountry: this.profile.mailingCountry,
            MailISOCode:this.profile.mailingISOCode,
            HolidayGift:this.holidaygift,
            Notes : this.specialInstructions,
            IsEncryptionRequired : this.selectedCard.isEncryptionRequired ? this.selectedCard.isEncryptionRequired : false
            billid : this.selectedCard.billid ? this.selectedCard.billid : 0;
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
        orderBundle.productDetails = this.orders.filter((a) => {
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
                        ,SortOrder:0,
                        item: a.item,
                        descr:a.descr,
                        productType:a.productType
                    });
            });   
        //orderBundle.orderImpDetails = { AddressId: this.selectedAddress.id, CreditCardId: this.selectedCard.id };
        this.appService.httpPost('post:save:approve:request', orderBundle);
    };

    /*removePayMethod(){
        this.selectedCard={};
    };*/
    otherOptionsClicked() {
        if (Object.keys(this.selectedCard).length == 0) {
            this.selectedCard = this.defaultCard;
        } else {
            this.selectedCard = {};
        }
        this.isPaymentOptionSelected=true;
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
          let totWineaddlCost = this.footer.wineTotals.addl/1 + this.footer.salesTaxTotals.addl/1 + this.footer.shippingTotals.addl/1
            + this.footer.prevBalances.addl/1;
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
        /*if(this.sameNofBottles){
            if(this.selectedAddress.addlshippingCharges > this.selectedAddress.shippingCharges){
                this.selectedAddress.addlshippingCharges = this.selectedAddress.addlshippingCharges - this.selectedAddress.shippingCharges;
            }
        }*/
        this.footer.shippingTotals = { wine: this.selectedAddress.shippingCharges, addl: (this.selectedAddress.addlshippingCharges - this.selectedAddress.shippingCharges) };
    };
    ngOnInit() {
        let ords = this.appService.request('orders');
        if (!ords) {
            this.router.navigate(['order']);
        }
        else
        {
            this.getArtifact();
            this.appService.httpGet('get:user:profile');
            //this.appService.httpGet('get:approve:artifacts')
        }
        this.appService.reply('close:pay:method:modal', () => { this.payMethodModal.close() });
    };
    ngOnDestroy() {
        this.approveArtifactsSub.unsubscribe();
        this.allAddrSubscription.unsubscribe();
        this.allCardSubscription.unsubscribe();
        this.selectNewCardSub.unsubscribe();
        
    };
    getArtifact(){
       this.orders = this.appService.request('orders');
       //this.holidaygift=this.orders.isholidayGift;
       this.holidaygift=this.appService.request('holidaygift');
       this.shippingBottles = this.orders.reduce(function (a, b, c) {
            return ({
                requestedShippingBottle: a.requestedShippingBottle + b.shippingBottles * b.orderQty
                , additinalShippingBottle: a.additinalShippingBottle + b.shippingBottles * b.wishList
                ,totalRequestedBottles : a.totalRequestedBottles + (b.orderQty * (b.packing == 's' ? 3 : b.packing == 'p' ? 6 : 1))
                ,totalWishlistBottles : a.totalWishlistBottles + (b.wishList * (b.packing == 's' ? 3 : b.packing == 'p' ? 6 : 1))
            })
        }, { requestedShippingBottle: 0, additinalShippingBottle: 0, totalRequestedBottles:0, totalWishlistBottles:0 });
        
        var shippedState = this.selectedAddress.state == undefined ? "" : this.selectedAddress.state;
        var shippedZip=this.selectedAddress.zip == undefined ? "" : this.selectedAddress.zip;
        if(this.shippingBottles.requestedShippingBottle == this.shippingBottles.additinalShippingBottle)
        {
            this.sameNofBottles=true;
            //this.shippingBottles.requestedShippingBottle = this.shippingBottles.requestedShippingBottle;
            //this.shippingBottles.additinalShippingBottle = this.shippingBottles.requestedShippingBottle + this.shippingBottles.additinalShippingBottle;
        }
        else
        {
            this.sameNofBottles=false;
        }

        let body:any={};
        body.data = JSON.stringify({sqlKey:'GetApproveArtifacts', sqlParms:{ 
            requestedShippingBottle: this.shippingBottles.requestedShippingBottle,
            additinalShippingBottle: (this.shippingBottles.requestedShippingBottle + this.shippingBottles.additinalShippingBottle),
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
            additinalShippingBottle: this.shippingBottles.requestedShippingBottle + this.shippingBottles.additinalShippingBottle,
            shippingState:shippedState,
            shippingZip:shippedZip
        }});
        this.appService.httpGet('get:approve:artifacts:ShippingandSalesTax',body);
        //this.appService.httpGet('get:approve:artifacts', body)
       // this.appService.httpGet('get:approve:artifacts')
   }
}