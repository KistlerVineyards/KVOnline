import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { Login } from '../login/login.component';
import { CreateAccount } from '../createAccount/createAccount.component';
import { ForgotPassword, SendPassword, ChangePassword } from '../managePassword/managePassword.component';
import { Order } from '../order/order.component';
import { Profile } from '../profile/profile.component';
import { Receipt } from '../receipt/receipt.component';
import { OrderHistory } from '../orderHistory/orderHistory.component';
import { ShippingAddress } from '../shippingAddress/shippingAddress.component';
import { PaymentMethod } from '../paymentMethod/paymentMethod.component';
import { ApproveOrder } from '../approveOrder/approveOrder.component';
import { CreatePassword } from '../managePassword/createPassword.component';
import { LoginGuard } from '../../services/app.service';
const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'order',
        component: Order
        , canActivate: [LoginGuard]
    },
    {
        path: 'forgot/password',
        component: ForgotPassword
    },
    {
        path: 'send/password',
        component: SendPassword
    },
    {
        path:'create/password',
        component:CreatePassword
    },
    {
        path: 'change/password',
        component: ChangePassword
        , canActivate: [LoginGuard]
    },
    {
        path: 'create/account',
        component: CreateAccount
    },
    {
        path: 'profile',
        component: Profile
        , canActivate: [LoginGuard]
    },
    {
        path: 'approve/order',
        component: ApproveOrder
        , canActivate: [LoginGuard]
    },
    {
        path: 'receipt',
        component: Receipt
        , canActivate: [LoginGuard]
    },
    {
        path: 'order/history',
        component: OrderHistory
        , canActivate: [LoginGuard]
    },
    {
        path: 'shipping/address',
        component: ShippingAddress
        , canActivate: [LoginGuard]
    },
    {
        path: 'payment/method',
        component: PaymentMethod
        , canActivate: [LoginGuard]
    },
    {
        path: '**',
        redirectTo: '/login',
        pathMatch: 'full'
    }
];
export const Routing: ModuleWithProviders = RouterModule.forRoot(routes);