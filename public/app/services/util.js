"use strict";
var moment = require("moment");
var Util = (function () {
    function Util(appService) {
        this.appService = appService;
        //console.log(moment());
    }
    Util.convertToUSDate = function (inStr) {
        var ret = null;
        if (inStr) {
            var date = moment(inStr);
            if (date.isValid()) {
                ret = date.format('MM/DD/YYYY');
            }
        }
        return (ret);
    };
    ;
    //date object to iso date
    Util.getISODate = function (d) {
        var date = moment(d, 'MM/DD/YYYY');
        var ret = null;
        if (date.isValid()) {
            ret = date.format('YYYY-MM-DD');
        }
        return (ret);
    };
    ;
    Util.getMaskedCCNumber = function (ccNumber) {
        //ccNumber = ccNumber.substring(0,4) + ' XXXX XXXX ' + ccNumber.substr(ccNumber.length - 4, 4 )
        ccNumber = ccNumber.substring(0, ccNumber.length - 4).replace(new RegExp("[0-9]", "g"), "X") + ccNumber.substring(ccNumber.length - 4, ccNumber.length);
        ccNumber = ccNumber.toString();
        return (ccNumber);
    };
    return Util;
}());
exports.Util = Util;
//# sourceMappingURL=util.js.map