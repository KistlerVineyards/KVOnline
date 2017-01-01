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
var core_1 = require("@angular/core");
var app_service_1 = require("../services/app.service");
var Spinner = require("spin.js");
var ng2_modal_1 = require("ng2-modal");
var SpinnerComponent = (function () {
    function SpinnerComponent(appService) {
        this.appService = appService;
        this.blocked = false;
        this.lines = 12; // The number of lines to draw
        this.length = 20; // The length of each line
        this.width = 12; // The line thickness
        this.radius = 50; // The radius of the inner circle
        this.scale = 1.0; // Scales overall size of the spinner
        this.corners = 1; // Corner roundness (0..1)
        this.color = '#000'; // #rgb or #rrggbb or array of colors
        this.opacity = 0.25; // Opacity of the lines
        this.rotate = 0; // The rotation offset
        this.direction = 1; // 1: clockwise, -1: counterclockwise
        this.speed = 1; // Rounds per second
        this.trail = 60; // Afterglow percentage
        this.fps = 20; // Frames per second when using setTimeout() as a fallback for CSS
        this.zIndex = 2e9; // The z-index (defaults to 2000000000)
        this.className = 'spinner'; // The CSS class to assign to the spinner
        this.top = '50%'; // Top position relative to parent
        this.left = '50%'; // Left position relative to parent
        this.shadow = true; // Whether to render a shadow
        this.hwaccel = false; // Whether to use hardware acceleration
        this.position = 'absolute'; // Element positioning
        this.backDrop = false; // to show background disabled or not
    }
    SpinnerComponent.prototype.ngOnInit = function () {
        var _this = this;
        var options = {
            lines: this.lines,
            length: this.length,
            width: this.width,
            radius: this.radius,
            scale: this.scale,
            corners: this.corners,
            color: this.color,
            opacity: this.opacity,
            rotate: this.rotate,
            direction: this.direction,
            speed: this.speed,
            trail: this.trail,
            fps: this.fps,
            zIndex: 2e9,
            className: this.className,
            top: this.top,
            left: this.left,
            shadow: this.shadow,
            hwaccel: this.hwaccel,
            position: this.position
        };
        this.spinner = new Spinner();
        // this.appService.spinnerObservable.subscribe(d => {
        //     if (d) {
        //         this.show();
        //     } else {
        //         this.hide();
        //     }
        // });
        this.behSubscription = this.appService.behFilterOn('spinner:hide:show').subscribe(function (d) {
            if (d.data) {
                _this.show();
            }
            else {
                _this.hide();
            }
        });
    };
    ;
    SpinnerComponent.prototype.show = function () {
        this.spinner.spin(this.mySpinner.nativeElement);
        if (this.backDrop) {
            this.blocked = true;
        }
    };
    ;
    SpinnerComponent.prototype.hide = function () {
        this.spinner.stop();
        if (this.backDrop) {
            this.blocked = false;
        }
    };
    ;
    SpinnerComponent.prototype.ngOnDestroy = function () {
        this.behSubscription.unsubscribe();
    };
    ;
    return SpinnerComponent;
}());
__decorate([
    core_1.ViewChild('spinnerModal'),
    __metadata("design:type", ng2_modal_1.Modal)
], SpinnerComponent.prototype, "spinnerModal", void 0);
__decorate([
    core_1.ViewChild('ng2Spinner'),
    __metadata("design:type", Object)
], SpinnerComponent.prototype, "mySpinner", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], SpinnerComponent.prototype, "lines", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], SpinnerComponent.prototype, "length", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], SpinnerComponent.prototype, "width", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], SpinnerComponent.prototype, "radius", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], SpinnerComponent.prototype, "scale", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], SpinnerComponent.prototype, "corners", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], SpinnerComponent.prototype, "color", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], SpinnerComponent.prototype, "opacity", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], SpinnerComponent.prototype, "rotate", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], SpinnerComponent.prototype, "direction", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], SpinnerComponent.prototype, "speed", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], SpinnerComponent.prototype, "trail", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], SpinnerComponent.prototype, "fps", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], SpinnerComponent.prototype, "zIndex", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], SpinnerComponent.prototype, "className", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], SpinnerComponent.prototype, "top", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], SpinnerComponent.prototype, "left", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], SpinnerComponent.prototype, "shadow", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], SpinnerComponent.prototype, "hwaccel", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], SpinnerComponent.prototype, "position", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], SpinnerComponent.prototype, "backDrop", void 0);
SpinnerComponent = __decorate([
    core_1.Component({
        selector: 'ng2-spinner',
        template: "\n    <p-blockUI [blocked]=\"blocked\"></p-blockUI>\n    <div #ng2Spinner></div>\n     "
    }),
    __metadata("design:paramtypes", [app_service_1.AppService])
], SpinnerComponent);
exports.SpinnerComponent = SpinnerComponent;
//# sourceMappingURL=app.spinner.js.map