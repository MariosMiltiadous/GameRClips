import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: ''
  }

  showAlert = false;
  alertMsg = "Please wait! We are logging you in.";
  alertColor = "blue";
  inSubmision = false;

  constructor(
    private auth: AngularFireAuth
  ) { }
  
  ngOnInit(): void {

  }

  async login() {
    this.showAlert = true;
    this.alertMsg = "Please wait! We are logging you in.";
    this.alertColor = "blue";
    this.inSubmision = true;

    try {
    
      await this.auth.signInWithEmailAndPassword(this.credentials.email, this.credentials.password);
    }
    catch (error) {
      console.log(error);
      this.alertMsg = "An unexpected error occured. Please try agan later.";
      this.alertColor = "red";
      this.inSubmision = false;
      return
    }

    this.alertMsg = "Success! You are logged in."
    this.alertColor = "green"
  }
}
