"use strict";
var router_1 = require('@angular/router');
var login_component_1 = require('../login/login.component');
var createAccount_component_1 = require('../createAccount/createAccount.component');
var managePassword_component_1 = require('../managePassword/managePassword.component');
var order_component_1 = require('../order/order.component');
var profile_component_1 = require('../profile/profile.component');
var receipt_component_1 = require('../receipt/receipt.component');
var orderHistory_component_1 = require('../orderHistory/orderHistory.component');
var shippingAddress_component_1 = require('../shippingAddress/shippingAddress.component');
var paymentMethod_component_1 = require('../paymentMethod/paymentMethod.component');
var approveOrder_component_1 = require('../approveOrder/approveOrder.component');
var createPassword_component_1 = require('../managePassword/createPassword.component');
var app_service_1 = require('../../services/app.service');
var routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: login_component_1.Login
    },
    {
        path: 'order',
        component: order_component_1.Order,
        canActivate: [app_service_1.LoginGuard]
    },
    {
        path: 'forgot/password',
        component: managePassword_component_1.ForgotPassword
    },
    {
        path: 'send/password',
        component: managePassword_component_1.SendPassword
    },
    {
        path: 'create/password',
        component: createPassword_component_1.CreatePassword
    },
    {
        path: 'change/password',
        component: managePassword_component_1.ChangePassword,
        canActivate: [app_service_1.LoginGuard]
    },
    {
        path: 'create/account',
        component: createAccount_component_1.CreateAccount
    },
    {
        path: 'profile',
        component: profile_component_1.Profile,
        canActivate: [app_service_1.LoginGuard]
    },
    {
        path: 'approve/order',
        component: approveOrder_component_1.ApproveOrder,
        canActivate: [app_service_1.LoginGuard]
    },
    {
        path: 'receipt',
        component: receipt_component_1.Receipt,
        canActivate: [app_service_1.LoginGuard]
    },
    {
        path: 'order/history',
        component: orderHistory_component_1.OrderHistory,
        canActivate: [app_service_1.LoginGuard]
    },
    {
        path: 'shipping/address',
        component: shippingAddress_component_1.ShippingAddress,
        canActivate: [app_service_1.LoginGuard]
    },
    {
        path: 'payment/method',
        component: paymentMethod_component_1.PaymentMethod,
        canActivate: [app_service_1.LoginGuard]
    },
    {
        path: '**',
        redirectTo: '/login',
        pathMatch: 'full'
    }
];
exports.Routing = router_1.RouterModule.forRoot(routes);
//# sourceMappingURL=app.routes.js.map