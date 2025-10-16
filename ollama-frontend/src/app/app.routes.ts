import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { AiPage } from './ai/ai';
import { Payment } from './payment/payment';

export const routes: Routes = [
{ path: '', component: Home },
{ path: 'auth/login', component: Login },
{ path: 'auth/register', component: Register },
{ path: 'ai', component: AiPage },
{ path: 'payment', component: Payment },
{ path: '**', redirectTo: '' }
];