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
}