"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var AppComponent = (function () {
    function AppComponent(service) {
        this.service = service;
        this.pins = [];
        this.boards = [];
        this.isClicked = false;
        this.isSearching = false;
        this.distance = 0;
        this.session = this.service.session;
    }
    AppComponent.prototype.setMinDistance = function (event) {
        this.distance = +(event.target.value);
        this.service.minDistance = this.distance;
    };
    AppComponent.prototype.setCurrentBoard = function (event) {
        this.boardname = event.target.value;
    };
    AppComponent.prototype.login = function () {
        var _this = this;
        this.service.login().subscribe(function (session) {
            _this.session = _this.service.session;
        });
    };
    AppComponent.prototype.logout = function () {
        this.service.logout();
        this.session = null;
    };
    AppComponent.prototype.getBoards = function () {
        var _this = this;
        this.isClicked = true;
        this.service.boards().subscribe(function (boards) {
            _this.boards = boards;
            _this.isClicked = false;
        });
    };
    AppComponent.prototype.getPins = function () {
        var _this = this;
        this.isClicked = true;
        this.isSearching = false;
        this.service.pins(this.boardname).subscribe(function (pins) {
            _this.pins = pins;
            _this.isClicked = false;
            _this.isSearching = true;
        });
    };
    AppComponent = __decorate([
        core_1.Component({ selector: 'app-root', templateUrl: './app.component.html', styleUrls: ['./app.component.css'] })
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
