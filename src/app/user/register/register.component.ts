import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { AuthService } from 'src/app/services/auth.service';
import IUser from '../../models/user.model'
import { RegisterValidators } from '../validators/register-validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  constructor(private auth: AuthService) { }

  inSubmision = false;
  isLoading = false;

  name = new FormControl('', [Validators.required, Validators.minLength(3)])
  email = new FormControl('', [Validators.required, Validators.email])
  age = new FormControl<number | null>(null, [Validators.required, Validators.min(18), Validators.max(90)])
  password = new FormControl('', [
    Validators.required,
    Validators.min(18), Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)])
  confirm_password = new FormControl('', [
    Validators.required
  ])
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(13),
    Validators.maxLength(13),
  ])

  showAlert = false;
  alertMsg = "Please wait! Your account is being created.";
  alertColor = "blue";

  registerForm = new FormGroup({
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirm_password: this.confirm_password,
    phoneNumber: this.phoneNumber
  }, [RegisterValidators.match('password','confirm_password')]);

  async register() {
    this.inSubmision = true;
    this.isLoading = true;
    this.showAlert = true;
    this.alertMsg = "Please wait! Your account is being created.";
    this.alertColor = "blue";

    try {
      this.auth.createUser(this.registerForm.value as IUser)
        .then(() => {
          this.isLoading = false
        });
    }
    catch (error) {
      console.log(error);
      this.alertMsg = "An unexpected error occured. Please try agan later.";
      this.alertColor = "red";
      this.inSubmision = false;
      this.isLoading = true;
      return
    }

    this.alertMsg = "Success! Your account has been created."
    this.alertColor = "green"
  }
}
