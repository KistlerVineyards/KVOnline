import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './components/app.component';
import { Login } from './components/login/login.component';
import { CreateAccount } from './components/createAccount/createAccount.component';
import { ForgotPassword, SendPassword, ChangePassword } from './components/managePassword/managePassword.component';
import { Order } from './components/order/order.component';
import { AppService, LoginGuard } from './services/app.service';
import { Routing } from './components/routes/app.routes';
import { Profile } from './components/profile/profile.component';
import { ApproveOrder } from './components/approveOrder/approveOrder.component';
import { Receipt } from './components/receipt/receipt.component';
import { OrderHistory } from './components/orderHistory/orderHistory.component';
import { ShippingAddress } from './components/shippingAddress/shippingAddress.component';
import { PaymentMethod } from './components/paymentMethod/paymentMethod.component';
import { CustomValidators } from './services/customValidators';
import { ControlMessages } from './components/controlMessages/controlMessages.component';
import { CreatePassword } from './components/managePassword/createPassword.component';
import { ModalModule } from 'ng2-modal';
import { PaginationModule } from 'ng2-bootstrap/components/pagination';
import { AlertModule } from 'ng2-bootstrap/components/alert';
import { NgIdleModule } from '@ng-idle/core';
import { CalendarModule } from 'primeng/components/calendar/calendar';
import { ConfirmDialogModule } from 'primeng/components/confirmdialog/confirmdialog';
import { GrowlModule } from 'primeng/components/growl/growl';
import { Message, ConfirmationService } from 'primeng/components/common/api';
import { InputMaskModule } from 'primeng/components/inputMask/inputMask';
import { BlockUIModule } from 'primeng/primeng';
import { SpinnerComponent } from './components/app.spinner';

@NgModule({
  imports: [BrowserModule, HttpModule, Routing, FormsModule
    , ModalModule
    , AlertModule
    , PaginationModule
    , ReactiveFormsModule
    , FormsModule
    , CalendarModule
    , ConfirmDialogModule
    , InputMaskModule
    , GrowlModule
    , NgIdleModule.forRoot()
    , BlockUIModule
  ]
  , declarations: [AppComponent, Login, Order, ForgotPassword
    , SendPassword, ChangePassword, CreateAccount,
    Profile, ApproveOrder, Receipt, OrderHistory, ShippingAddress,
    PaymentMethod, ControlMessages, CreatePassword
    , SpinnerComponent
  ]
  , providers: [AppService, LoginGuard, CustomValidators, ConfirmationService]
  , bootstrap: [AppComponent]
})

export class AppModule { }
