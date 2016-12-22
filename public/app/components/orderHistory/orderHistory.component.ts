import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { PaginationModule } from 'ng2-bootstrap/components/Pagination';
import { AppService } from '../../services/app.service';

@Component({
    templateUrl: 'app/components/orderHistory/orderHistory.component.html'
})
export class OrderHistory {
    isDataAvailable: boolean = false;
    orderHeaderSub: Subscription;
    orderDetailsSub: Subscription;
    orderHeaders: [{}];
    orderDetails: any = { details: [{}], address: {}, card: {} };
    selectedOrder: {} = {};
    //Pagination
    pageRows: any;
    itemsPerPage: number = 5;
    maxSize: number = 5;
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
    };
    showDetails(order) {
        this.orderHeaders.map((a: any, b) => { a.checked = false; });//to uncheck all rows
        order.grandTotalWine = order.totalPriceWine / 1 + order.salesTaxWine / 1 + order.shippingWine / 1;
        order.grandTotalAddl = order.totalPriceAddl / 1 + order.salesTaxAddl / 1 + order.shippingAddl / 1;
        order.checked = true; // to check current row
        this.selectedOrder = order;
        this.appService.httpGet('get:order:details', { id: order.id })
    };
    ngOnInit() {
        this.appService.httpGet('get:order:headers')
    };
    ngOnDestroy() {
        this.orderHeaderSub.unsubscribe();
        this.orderDetailsSub.unsubscribe();
    };
}