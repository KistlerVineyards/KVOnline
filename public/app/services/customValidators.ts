import { FormControl, AbstractControl, FormGroup } from '@angular/forms';
import { Util } from './util';
export class CustomValidators {
    static emailValidator(control: FormControl) {
        if (!control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            return { 'invalidEmail': true };
        }
    };
    static emailValidation(control) {
         var filter = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
         if(control.value!=null){
            if (!filter.test(control.value)) {
                return { 'invalidEmail': true };
            }
         }
         else{
              return { 'invalidEmail': true };
         }
    };
    static stateValidation(state, country) {
         
         //if(formGroup["mailingState"] && country != null){
                var state = state.value;
                var country = country.value;
           //  }
            var t=0;
         t=t+1;
         
    };
    static usZipCodeValidator(control:FormControl){
        if(!control.value.match(/(^\d{5}$)|(^\d{5}-\d{4}$)/)){
            return({'invalidZipCode':true});
        }
    };

    static pwdComplexityValidator(control: FormControl) {
        /*At least 8 characters in length,
        at least 1 character from 3 out of the 4 following types:
            Lower case
            Upper case
            Number
            Special Character like �!@#$%^&*()�*/
        let ret = null;
        let pwd = control.value;
        if (pwd.length < 8) {
            ret = { 'pwdLengthLt8': true };
        } else {
            let hasUpperCase = + /[A-Z]/.test(pwd);
            let hasLowerCase = + /[a-z]/.test(pwd);
            let hasNumbers = + /\d/.test(pwd);
            let hasNonalphas = + /\W/.test(pwd);
            if (hasUpperCase + hasLowerCase + hasNumbers + hasNonalphas < 3) {
                ret = { 'invalidPwd': true };
            }
        }
        return (ret);
    };

    static phoneValidator(control: FormControl) {
        let ret;
        let international = /^\(?[+]?(\d{1})\)?[- ]?\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
        let domestic = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
        let local = /^\(?(\d{3})\)?[- ]?(\d{4})$/;
        let general = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i;
        if(control.value == null){
            ret = null;
        } else 
        if (!(control.value.match(international))
            && (!control.value.match(domestic)
                && (!control.value.match(local))
                 && (!control.value.match(general))
            )) {
            ret = { 'invalidPhone': true };
        }
        
        return(ret);
    };

    // static usDateValidator(control:FormControl){
    //     let dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
    //     let mDate = control.value.toLocaleString();
    //     if (!mDate.match(dateRegex)){
    //         return{'invalidDate':true};
    //     }
    // }

    static creditCardValidator(control) {
        // Visa, MasterCard, American Express, Diners Club, Discover, JCB
        if (control.value.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
            return null;
        } else {
            return { 'invalidCreditCard': true };
        }
    }
    static creditCardSecurityCodeValidator(control) {
        // Visa, MasterCard, American Express, Diners Club, Discover, JCB
        let patteren = /^[0-9]{3,4}$/;
        if (control.value.match(patteren)) {
            return null;
        } else {
            return { 'invalidSecurityCode': true };
        }
    }
    static expiryMonthYearValidator(formGroup: FormGroup) {
        let ret;
        let month = formGroup.controls['ccExpiryMonth'].value / 1;
        let year = formGroup.controls['ccExpiryYear'].value / 1
        if (!Util.isValidExpiryMonthYear(month, year)) {
            ret = { 'InvalidExpiryMonthYear': true };
        }
        return (ret);
    };
    static creditCardexpiryMonthValidator(control) {
        let val = parseInt(control.value);
        //let firstDigit = control.value[0];
        if(val<0)
        {
            return { 'invalidExpiryMonth': true };
        }
        if(control.value == "0"){
            return { 'invalidExpiryMonth': true };
        }
        else if(control.value == "00"){
            return { 'invalidExpiryMonth': true };
        }
        if(val > 12){
            return { 'invalidExpiryMonth': true };
        }
        else{
            return null;
        }
    };
    
    static creditCardYearValidator(control) {
        // Visa, MasterCard, American Express, Diners Club, Discover, JCB
        var dt = new Date();
        var year = dt.getFullYear();
        var expyear = (year + 7);
        var ccYear = parseInt(control.value);
        if (!(ccYear >= year && ccYear <= expyear)) {
            return { 'invalidExpiryYear': true };
        } else {
            return null;
        }
    }
    static StateLengthValidator(control) {
        if(control.value!=null){
            if(control.value.length > 11)
            {
                return { 'invalidState': true };
            }
            else 
            {
                return null;
            }
        }
    }
    static CCFirstNameLengthValidator(control) {
        if(control.value!=null){
            if(control.value.length > 20)
            {
                return { 'invalidCCFirstName': true };
            }
            else 
            {
                return null;
            }
        }
    }
    static CCLastNameLengthValidator(control) {
        if(control.value!=null){
            if(control.value.length > 20)
            {
                return { 'invalidCCLastName': true };
            }
            else 
            {
                return null;
            }
        }
    }
}