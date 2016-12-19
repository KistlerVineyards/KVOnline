import { FormControl, AbstractControl, FormGroup } from '@angular/forms';
export class CustomValidators {
    static emailValidator(control: FormControl) {
        if (!control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            return { 'invalidEmail': true };
        }
    };

    static usZipCodeValidator(control:FormControl){
        if(!control.value.match(/(^\d{5}$)|(^\d{5}-\d{4}$)/)){
            return({'invalidZipCode':true});
        }
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
                // && (!control.value.match(general))
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
}