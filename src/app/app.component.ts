import { Component } from '@angular/core';
import { TrainService } from './service/train.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'unstop';

  constructor(private trainService: TrainService) {}

  // reset the seats array
  clearCoach() {
    this.trainService.reset();
  }
}
