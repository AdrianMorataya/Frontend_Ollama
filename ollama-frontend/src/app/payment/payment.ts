import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.html',
  styleUrls: ['./payment.scss']
})
export class Payment {
  constructor(private router: Router) {}
  goBack() {
    this.router.navigate(['/ai']);
  }
}
