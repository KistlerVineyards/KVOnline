import { Component, ViewChild, Input } from '@angular/core';
import { AppService } from '../services/app.service';
import Spinner = require("spin.js");
import { ModalModule, Modal } from "ng2-modal";
import { BlockUIModule } from 'primeng/primeng';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'ng2-spinner',
    template:
    `
    <p-blockUI [blocked]="blocked"></p-blockUI>
    <div #ng2Spinner></div>
     `
})
export class SpinnerComponent {
    blocked: boolean = false;
    behSubscription:Subscription;
    @ViewChild('spinnerModal') spinnerModal: Modal;
    @ViewChild('ng2Spinner') mySpinner: any;
    @Input() lines: number = 12; // The number of lines to draw
    @Input() length: number = 20; // The length of each line
    @Input() width: number = 12; // The line thickness
    @Input() radius: number = 50; // The radius of the inner circle
    @Input() scale: number = 1.0; // Scales overall size of the spinner
    @Input() corners: number = 1; // Corner roundness (0..1)
    @Input() color: string = '#000'; // #rgb or #rrggbb or array of colors
    @Input() opacity: number = 0.25; // Opacity of the lines
    @Input() rotate: number = 0; // The rotation offset
    @Input() direction: number = 1; // 1: clockwise, -1: counterclockwise
    @Input() speed: number = 1; // Rounds per second
    @Input() trail: number = 60; // Afterglow percentage
    @Input() fps: number = 20; // Frames per second when using setTimeout() as a fallback for CSS
    @Input() zIndex: any = 2e9; // The z-index (defaults to 2000000000)
    @Input() className: string = 'spinner'; // The CSS class to assign to the spinner
    @Input() top: string = '50%'; // Top position relative to parent
    @Input() left: string = '50%'; // Left position relative to parent
    @Input() shadow: boolean = true; // Whether to render a shadow
    @Input() hwaccel: boolean = false; // Whether to use hardware acceleration
    @Input() position: string = 'absolute'; // Element positioning
    @Input() backDrop: boolean = false; // to show background disabled or not
    spinner: Spinner;
    constructor(private appService: AppService) {

    }
    ngOnInit() {
        let options = {
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
            zIndex: 2e9, // Artificially high z-index to keep on top
            className: this.className,
            top: this.top,
            left: this.left,
            shadow: this.shadow,
            hwaccel: this.hwaccel,
            position: this.position
        }
        this.spinner = new Spinner();
        // this.appService.spinnerObservable.subscribe(d => {
        //     if (d) {
        //         this.show();
        //     } else {
        //         this.hide();
        //     }
        // });
       this.behSubscription = this.appService.behFilterOn('spinner:hide:show').subscribe(d=>{
            if(d.data){
                this.show();
            } else{
                this.hide();
            }
        });
    };
    show() {
        this.spinner.spin(this.mySpinner.nativeElement);
        if (this.backDrop) {
            this.blocked = true;
        }
    };

    hide() {
        this.spinner.stop();
        if (this.backDrop) {
            this.blocked = false;
        }
    };

    ngOnDestroy() {
        this.behSubscription.unsubscribe();        
    };
}