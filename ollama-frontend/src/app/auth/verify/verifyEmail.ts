import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
selector: 'app-verify-email',
standalone: true,
imports: [CommonModule, FormsModule, RouterModule],
templateUrl: './verify-email.html',
styleUrls: ['./verify-email.scss']
})
export class VerifyEmail implements OnInit {
email = '';
code = '';
errorMessage = '';
successMessage = '';
loading = false;
showEmailInput = false;
isFromLogin = false;
allowEditEmail = false;
isReadonly = false;

constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
) {}

ngOnInit() {
this.route.queryParams.subscribe(params => {
    if (params['email']) {
    this.email = params['email'];
    }

    if (params['fromLogin'] === 'true') {
    this.showEmailInput = true;
    this.allowEditEmail = false;
    this.isReadonly = true;
    } else if (params['fromHome'] === 'true') {
    this.showEmailInput = true;
    this.allowEditEmail = true;
    this.isReadonly = false;
    } else {
    this.showEmailInput = false;
    this.allowEditEmail = false;
    this.isReadonly = false;
    }
});
}

codeDigits: string[] = Array(6).fill('');

trackByIndex(index: number, item: any) {
return index;
}

onDigitInput(event: any, index: number) {
const input = event.target as HTMLInputElement;
let value = input.value;

value = value.replace(/[^0-9]/g, '');
input.value = value;
this.codeDigits[index] = value;

if (value && index < this.codeDigits.length - 1) {
    const nextInput = input.nextElementSibling as HTMLElement;
    if (nextInput) nextInput.focus();
}

if (!value && index > 0) {
    const prevInput = input.previousElementSibling as HTMLElement;
    if (prevInput) prevInput.focus();
}
}

verify() {
const code = this.codeDigits.join('');
this.errorMessage = '';
this.successMessage = '';
this.loading = true;

this.authService.verifyEmail(this.email, code).subscribe({
    next: () => {
    this.successMessage = 'Correo verificado correctamente';
    setTimeout(() => {
        this.loading = false;
        this.router.navigate(['/auth/login']);
    }, 1000);
    },
    error: () => {
    this.errorMessage = 'Código incorrecto';
    this.loading = false;
    }
});
}

}
