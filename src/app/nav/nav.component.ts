import { Component, OnInit } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { AuthService } from '../services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  constructor(public modal: ModalService,
    public auth: AuthService,
    public afAuth: AngularFireAuth) {
  }

  ngOnInit(): void {

  }

  openModal($event: Event) {
    $event.preventDefault();// prevent users redirect to different page
    this.modal.toggleModal('auth');
  }

  async logout($event: Event) {
    $event.preventDefault();
    await this.afAuth.signOut();
  }
}
