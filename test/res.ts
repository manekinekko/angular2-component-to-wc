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