import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class TrainService {
  totalSeats: number[] = [];

  constructor(private firestore: AngularFirestore) {}

  reset() {
    console.log('reset');
    return this.firestore
      .collection('bookings')
      .doc('3cRBsKQrhs4MFf4amrrX')
      .update({
        seats: Array(80).fill(0),
      });
  }

  // get the seats array
  getSeats() {
    return this.firestore
      .collection('bookings')
      .doc('3cRBsKQrhs4MFf4amrrX')
      .get();
  }

  // update the seats array
  updateSeats(seats: number) {
    console.log('updateSeats', seats);
    this.getSeats().subscribe((data: any) => {
      this.totalSeats = data.data().seats;

      // check if the seats are available
      if (
        this.stringToNumber(
          this.totalSeats.filter((seat) => seat === 1).length + ''
        ) +
          this.stringToNumber(seats + '') >
        80
      ) {
        console.log(
          'Seats not available',
          seats,
          '',
          this.totalSeats.filter((seat) => seat === 1).length + seats
        );
      }

      // if seats are available
      else {
        // get the index of avilaible seats
        const availableSeats = this.totalSeats
          .map((seat, index) => (seat === 0 ? index : -1))
          .filter((seat) => seat !== -1);
        console.log('availableSeats', availableSeats);

        let minDistance: number = Infinity;
        let bestCombination: number[] = [];
        let combinations = this.getCombinations(availableSeats, seats);
        console.log('combination', combinations);

        for (let combination of combinations) {
          let distance = this.getDistance(combination);
          if (distance < minDistance) {
            minDistance = distance;
            bestCombination = combination;
          }
        }

        console.log('bestCombination', bestCombination);

        // update the seats array with available seats
        if (bestCombination) {
          for (let i = 0; i < seats; i++) {
            this.totalSeats[bestCombination[i]] = 1;
          }
        }

        console.log('totalSeats', this.totalSeats);

        // update the seats array in the database
        this.firestore
          .collection('bookings')
          .doc('3cRBsKQrhs4MFf4amrrX')
          .update({
            seats: this.totalSeats,
          });
      }
    });
  }

  getCombinations(avilaibleSeats: number[], bookedSeats: number) {
    console.log('get combination => avilaibleSeats', avilaibleSeats);
    if (bookedSeats === 0) {
      return [];
    }
    if (bookedSeats === 1) {
      return avilaibleSeats.map((seat) => [seat]);
    }
    let combinations: number[][] = [];

    for (let i = 0; i < avilaibleSeats.length; i++) {
      let rest = this.getCombinations(
        avilaibleSeats.slice(i + 1),
        bookedSeats - 1
      );
      // for (let j = 0; j < rest.length; j++) {
      //   const comb: number[] = [avilaibleSeats[i]];
      //   combinations.push(comb.concat(rest[j]));
      // }
      for (let combination of rest) {
        combinations.push([avilaibleSeats[i], ...combination]);
      }
    }
    return combinations;
  }

  getDistance(seats: number[]) {
    console.log('getDistance => seats', seats);
    let distance = 0;
    for (let i = 0; i < seats.length - 1; i++) {
      distance += Math.abs(seats[i] - seats[i + 1]);
    }
    return distance;
  }

  findBestSeatCombination(
    availableSeatsIndex: number[],
    bookedSeats: number
  ): number[] {
    const seatsPerRow = 7;
    const rows = Math.ceil(80 / seatsPerRow);

    const consecutiveSeats = this.findConsecutiveSeats(
      availableSeatsIndex,
      bookedSeats
    );
    if (consecutiveSeats.length >= bookedSeats) {
      return consecutiveSeats.slice(0, bookedSeats);
    }

    const seatsCombination = [];
    let startIndex = 0;

    for (let i = 0; i < rows; i++) {
      const rowSeats = availableSeatsIndex.slice(
        startIndex,
        startIndex + seatsPerRow
      );
      const combination = this.findConsecutiveSeats(rowSeats, bookedSeats);

      if (combination.length >= bookedSeats) {
        seatsCombination.push(...combination.slice(0, bookedSeats));
        break;
      } else {
        seatsCombination.push(...combination);
        startIndex += seatsPerRow;
      }
    }

    return seatsCombination;
  }

  findConsecutiveSeats(seats: number[], bookedSeats: number): number[] {
    const consecutiveSeats: number[] = [];
    let currentConsecutiveCount = 0;

    for (let i = 0; i < seats.length; i++) {
      const seatIndex = seats[i];
      const nextSeatIndex = seats[i + 1];

      if (nextSeatIndex === seatIndex + 1) {
        currentConsecutiveCount++;
        consecutiveSeats.push(seatIndex);
      } else {
        currentConsecutiveCount = 0;
        consecutiveSeats.length = 0;
      }

      if (currentConsecutiveCount === bookedSeats - 1) {
        consecutiveSeats.push(nextSeatIndex);
        break;
      }
    }

    return consecutiveSeats;
  }

  // sum of 2 strings by converting them to numbers
  sumStrings(a: string, b: string) {
    return (parseInt(a) + parseInt(b)).toString();
  }

  // string to number
  stringToNumber(a: string) {
    return parseInt(a);
  }
}
