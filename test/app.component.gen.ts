import {  Component, EventEmitter}from '@angular/core';
import {  PinterestService}from './pinterest.service';
let Component = o => o;
let metadata = Component({  selector : 'app-root', templateUrl : './app.component.html', styleUrls : ['./app.component.css']});
export class AppComponent extends HTMLElement { pins = [];
boards = [];
isClicked = false;
isSearching = false;
distance = 0;
boardname;
session;
constructor(private service : PinterestService){
super();
 this.session = this.service.session;
}setMinDistance(event){
 this.distance = +(event.target.value);
this.service.minDistance = this.distance;
}setCurrentBoard(event){
 this.boardname = event.target.value;
}login(){
 this.service.login().subscribe(session => {
 this.session = this.service.session;
})}logout(){
 this.service.logout();
this.session = null;
}getBoards(){
 this.isClicked = true;
this.service.boards().subscribe(boards => {
 this.boards = boards;
this.isClicked = false;
});
}getPins(){
 this.isClicked = true;
this.isSearching = false;
this.service.pins(this.boardname).subscribe(pins => {
 this.pins = pins;
this.isClicked = false;
this.isSearching = true;
});


(<any>document).registerElement(metadata.selector, AppComponent);