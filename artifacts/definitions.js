"use strict";
// var NError = (function () {
//     function NError(_status, _message, _details) {
//         this.status = _status;
//         this.message = _message;
//         this.details = _details;
//     }
//     return NError;
// } ());
class NError {
    // status;
    // message;
    // details;
    constructor(_status,_message,_details) {
        this.status = _status;
        this.message = _message;
        this.details = _details;
    }
}
exports.NError = NError;
