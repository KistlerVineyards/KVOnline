"use strict";
var util_1 = require("./util");
var CustomValidators = (function () {
    function CustomValidators() {
    }
    CustomValidators.emailValidator = function (control) {
        if (!control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            return { 'invalidEmail': true };
        }
    };
    ;
    CustomValidators.emailValidation = function (control) {
        var filter = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        if (control.value != null) {
            if (!filter.test(control.value)) {
                return { 'invalidEmail': true };
            }
        }
        else {
            return { 'invalidEmail': true };
        }
    };
    ;
    CustomValidators.stateValidation = function (state, country) {
        //if(formGroup["mailingState"] && country != null){
        var state = state.value;
        var country = country.value;
        //  }
        var t = 0;
        t = t + 1;
    };
    ;
    CustomValidators.usZipCodeValidator = function (control) {
        if (!control.value.match(/(^\d{5}$)|(^\d{5}-\d{4}$)/)) {
            return ({ 'invalidZipCode': true });
        }
    };
    ;
    CustomValidators.pwdComplexityValidator = function (control) {
        /*At least 8 characters in length,
        at least 1 character from 3 out of the 4 following types:
            Lower case
            Upper case
            Number
            Special Character like �!@#$%^&*()�*/
        var ret = null;
        var pwd = control.value;
        if (pwd.length < 8) {
            ret = { 'pwdLengthLt8': true };
        }
        else {
            var hasUpperCase = +/[A-Z]/.test(pwd);
            var hasLowerCase = +/[a-z]/.test(pwd);
            var hasNumbers = +/\d/.test(pwd);
            var hasNonalphas = +/\W/.test(pwd);
            if (hasUpperCase + hasLowerCase + hasNumbers + hasNonalphas < 3) {
                ret = { 'invalidPwd': true };
            }
        }
        return (ret);
    };
    ;
    CustomValidators.phoneValidator = function (control) {
        var ret;
        var international = /^\(?[+]?(\d{1})\)?[- ]?\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
        var domestic = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
        var local = /^\(?(\d{3})\)?[- ]?(\d{4})$/;
        var general = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i;
        if (control.value == null) {
            ret = null;
        }
        else if (!(control.value.match(international))
            && (!control.value.match(domestic)
                && (!control.value.match(local))
                && (!control.value.match(general)))) {
            ret = { 'invalidPhone': true };
        }
        return (ret);
    };
    ;
    // static usDateValidator(control:FormControl){
    //     let dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
    //     let mDate = control.value.toLocaleString();
    //     if (!mDate.match(dateRegex)){
    //         return{'invalidDate':true};
    //     }
    // }
    CustomValidators.creditCardValidator = function (control) {
        // Visa, MasterCard, American Express, Diners Club, Discover, JCB
        if (control.value.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
            return null;
        }
        else {
            return { 'invalidCreditCard': true };
        }
    };
    CustomValidators.creditCardSecurityCodeValidator = function (control) {
        // Visa, MasterCard, American Express, Diners Club, Discover, JCB
        var patteren = /^[0-9]{3,4}$/;
        if (control.value.match(patteren)) {
            return null;
        }
        else {
            return { 'invalidSecurityCode': true };
        }
    };
    CustomValidators.expiryMonthYearValidator = function (formGroup) {
        var ret;
        var month = formGroup.controls['ccExpiryMonth'].value / 1;
        var year = formGroup.controls['ccExpiryYear'].value / 1;
        if (!util_1.Util.isValidExpiryMonthYear(month, year)) {
            ret = { 'InvalidExpiryMonthYear': true };
        }
        return (ret);
    };
    ;
    CustomValidators.creditCardexpiryMonthValidator = function (control) {
        var val = parseInt(control.value);
        //let firstDigit = control.value[0];
        if (val < 0) {
            return { 'invalidExpiryMonth': true };
        }
        if (control.value == "0") {
            return { 'invalidExpiryMonth': true };
        }
        else if (control.value == "00") {
            return { 'invalidExpiryMonth': true };
        }
        if (val > 12) {
            return { 'invalidExpiryMonth': true };
        }
        else {
            return null;
        }
    };
    ;
    CustomValidators.creditCardYearValidator = function (control) {
        // Visa, MasterCard, American Express, Diners Club, Discover, JCB
        var dt = new Date();
        var year = dt.getFullYear();
        var expyear = (year + 7);
        var ccYear = parseInt(control.value);
        if (!(ccYear >= year && ccYear <= expyear)) {
            return { 'invalidExpiryYear': true };
        }
        else {
            return null;
        }
    };
    CustomValidators.StateLengthValidator = function (control) {
        if (control.value != null) {
            if (control.value.length > 11) {
                return { 'invalidState': true };
            }
            else {
                return null;
            }
        }
    };
    CustomValidators.CCFirstNameLengthValidator = function (control) {
        if (control.value != null) {
            if (control.value.length > 20) {
                return { 'invalidCCFirstName': true };
            }
            else {
                return null;
            }
        }
    };
    CustomValidators.CCLastNameLengthValidator = function (control) {
        if (control.value != null) {
            if (control.value.length > 20) {
                return { 'invalidCCLastName': true };
            }
            else {
                return null;
            }
        }
    };
    return CustomValidators;
}());
exports.CustomValidators = CustomValidators;
//# sourceMappingURL=customValidators.js.map