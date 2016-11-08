import { Component, EventEmitter } from '@angular/core';
import {PinterestService} from './pinterest.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  pins = [];
  boards = [];
  isClicked = false;
  isSearching = false;
  distance = 0;
  boardname;
  session;
  constructor(
    private service: PinterestService
  ) {
    this.session = this.service.session;
  }
  setMinDistance(event) {
    this.distance = +(event.target.value);
    this.service.minDistance = this.distance;
  }
  setCurrentBoard(event) {
    this.boardname = event.target.value;
  }
  login() {
    this.service.login().subscribe( session => {
      this.session = this.service.session;
    })
  }
  logout() {
    this.service.logout();
    this.session = null;
  }
  getBoards() {
    this.isClicked = true;
    this.service.boards().subscribe(boards => {
      this.boards = boards;
      this.isClicked = false;
    });
  }
  getPins() {
    this.isClicked = true;
    this.isSearching = false;
    this.service.pins(this.boardname).subscribe(pins => {
      this.pins = pins;
      this.isClicked = false;
      this.isSearching = true;
    });
  }
}



{
  provide: MyPlugin,
  useFactory: (dep1, dep2) => { 

    if (IS_NODE) {
      return new NodeHttp(dep1, dep2);
    }
    else if (IS_BROWSER) {
      return new Http(dep1, dep2);
    }

  },
  deps: [dep1, dep2]
}