import { Component, OnInit } from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireList,
} from '@angular/fire/compat/database';
import { TrainService } from 'src/app/service/train.service';

@Component({
  selector: 'app-train',
  templateUrl: './train.component.html',
  styleUrls: ['./train.component.css'],
})
export class TrainComponent implements OnInit {
  totalSeats: number = 80;
  seatsPerRow: number = 7;
  lastRowSeats: number = 3;
  rows: number = Math.floor(this.totalSeats / this.seatsPerRow);
  numSeats: number = 0;

  seatMapRef?: AngularFireList<any>;
  seatMap: any[] = [];

  constructor(private db: AngularFireDatabase) {
    this.seatMapRef = db.list('/seatMap');
  }

  ngOnInit() {
    // this.initializeSeatMap();
    this.getSeatMapFromFirebase();
  }

  initializeSeatMap() {
    console.log('initializeSeatMap');
    let seatNumber = 1;

    for (let row = 1; row <= this.rows; row++) {
      const seatsInRow =
        row === this.rows ? this.lastRowSeats : this.seatsPerRow;
      const seatRow = [];

      for (let seat = 1; seat <= seatsInRow; seat++) {
        seatRow.push({
          number: seatNumber++,
          booked: false,
        });
      }

      this.seatMap.push(seatRow);
    }
    console.log('this.seatMap initializeSeatMap', this.seatMap);
    // this.updateSeatMapInFirebase();
  }

  reserveSeats(numSeats: number) {
    console.log('reserveSeats');
    const avilaibleSeats = this.avilableSeats();
    console.log('avilaibleSeats', avilaibleSeats);
    if (numSeats > 7) {
      console.log('Cannot reserve more than 7 seats at a time.');
      alert('Cannot reserve more than 7 seats at a time.');
      return;
    }

    if (numSeats < 1) {
      console.log('You must reserve at least one seat.');
      alert('You must reserve at least one seat.');
      return;
    }

    if (numSeats == null) {
      console.log('There are not enough seats.');
      alert('There are not enough seats.');
      return;
    }

    if (numSeats > avilaibleSeats) {
      console.log('There are not enough seats.');
      alert('There are not enough seats.');
      return;
    }

    let seatsToBook = numSeats;
    let row = 0;

    while (seatsToBook > 0 && row < this.rows) {
      const seatRow = this.seatMap[row];
      let consecutiveSeats = 0;
      for (let seat = 0; seat < seatRow.length; seat++) {
        const currentSeat = seatRow[seat];

        if (!currentSeat.booked) {
          consecutiveSeats++;
        } else {
          consecutiveSeats = 0;
        }
        if (consecutiveSeats === numSeats) {
          for (let i = seat - numSeats + 1; i <= seat; i++) {
            seatRow[i].booked = true;
            seatsToBook--;
          }
          this.updateSeatMapInFirebase();
          return;
        }
      }
      row++;
    }

    // If seats in one row are not available, book nearby seats
    for (let row = 0; row < this.rows; row++) {
      const seatRow = this.seatMap[row];

      for (let seat = 0; seat < seatRow.length; seat++) {
        const currentSeat = seatRow[seat];

        if (!currentSeat.booked) {
          currentSeat.booked = true;
          seatsToBook--;

          if (seatsToBook === 0) {
            this.updateSeatMapInFirebase();
            return;
          }
        }
      }
    }
    this.updateSeatMapInFirebase();
  }

  getSeatMapFromFirebase() {
    this.seatMapRef!.valueChanges().subscribe((seatMap: any[]) => {
      if (seatMap.length > 0) {
        console.log('seatMap', seatMap);
        this.seatMap = seatMap[0];
      } else {
        this.initializeSeatMap();
      }
    });
  }

  updateSeatMapInFirebase() {
    // this.seatMapRef!.update('seats', this.seatMap);
    this.seatMapRef!.set('seats', this.seatMap);
  }

  avilableSeats() {
    let avilableSeats = 0;
    for (let row = 0; row < this.rows; row++) {
      const seatRow = this.seatMap[row];

      for (let seat = 0; seat < seatRow.length; seat++) {
        const currentSeat = seatRow[seat];

        if (!currentSeat.booked) {
          avilableSeats++;
        }
      }
    }
    return avilableSeats;
  }

  reset() {
    console.log('reset');
    this.seatMapRef!.remove('seats');
    // refresh the page
    window.location.reload();
  }
}
