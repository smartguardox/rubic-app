import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-trades-page',
  templateUrl: './trades-page.component.html',
  styleUrls: ['./trades-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradesPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
