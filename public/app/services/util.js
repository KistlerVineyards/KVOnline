"use strict";
var moment = require('moment');
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
    return Util;
}());
exports.Util = Util;
//# sourceMappingURL=util.js.map