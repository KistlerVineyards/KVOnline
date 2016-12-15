"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var forms_1 = require('@angular/forms');
var app_service_1 = require('../../services/app.service');
var ControlMessages = (function () {
    function ControlMessages(appService) {
        this.appService = appService;
    }
    ;
    ControlMessages.prototype.isValid = function () {
        var ret = true;
        if (this.control.errors) {
            var propertyArray = Object.keys(this.control.errors);
            if ((propertyArray.length > 0) && this.control.touched) {
                ret = false;
                this.errorMessage = this.appService.getValidationErrorMessage(propertyArray[0]);
            }
        }
        return (ret);
    };
    ;
    __decorate([
        core_1.Input(), 
        __metadata('design:type', forms_1.FormControl)
    ], ControlMessages.prototype, "control", void 0);
    ControlMessages = __decorate([
        core_1.Component({
            selector: 'control-messages',
            template: "<div class='validation' *ngIf=\"!isValid()\">{{errorMessage}}</div>",
            styles: ["\n    .validation { \n        color: #e80c4d;\n        font-weight: 700;\n        font-size: .9em; \n        margin-top:6px;\n    }   \n    "]
        }), 
        __metadata('design:paramtypes', [app_service_1.AppService])
    ], ControlMessages);
    return ControlMessages;
}());
exports.ControlMessages = ControlMessages;
//# sourceMappingURL=controlMessages.component.js.map