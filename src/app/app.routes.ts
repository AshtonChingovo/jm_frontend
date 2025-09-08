import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PastMeetupsComponent } from './pages/past-meetups/past-meetups.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'past-meetups', component: PastMeetupsComponent },
  { path: 'signin', component: SignInComponent },
  { path: '**', redirectTo: '' },
];
