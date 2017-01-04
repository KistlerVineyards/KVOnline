import { AppService } from './app.service';
import * as moment from 'moment';
export class Util {
    constructor(private appService: AppService) {
        //console.log(moment());
    }
    
    static convertToUSDate(inStr) {
        let ret = null;
        if (inStr) {
            let date = moment(inStr);
            if(date.isValid()){
                ret = date.format('MM/DD/YYYY');
            }
        }
        return (ret);
    };

    //date object to iso date
    static getISODate(d) {        
        let date = moment(d,'MM/DD/YYYY');
        let ret = null;
        if (date.isValid()) {
            ret = date.format('YYYY-MM-DD');
        }
        return (ret);
    };   
    static getMaskedCCNumber(ccNumber){
        //ccNumber = ccNumber.substring(0,4) + ' XXXX XXXX ' + ccNumber.substr(ccNumber.length - 4, 4 )
        ccNumber = ccNumber.substring(0, ccNumber.length -4).replace(new RegExp("[0-9]", "g"), "X") + ccNumber.substring(ccNumber.length -4, ccNumber.length);
        ccNumber = ccNumber.toString();
        return(ccNumber);
    } 
}