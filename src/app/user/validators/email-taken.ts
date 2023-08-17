import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth"
import { AbstractControl, AsyncValidator, ValidationErrors } from "@angular/forms";
import { Observable } from "rxjs";

// add decorator to the class to make this class injectable
@Injectable({
    providedIn:'root',
})
export class EmailTaken implements AsyncValidator {

    constructor(private auth: AngularFireAuth) {
    }

    // if we return a Promise, Angular will wait for the result value
    // if we return a Observable, Angular will subscribe to an observable
    validate = (control: AbstractControl): Promise<ValidationErrors | null> => {
       return this.auth.fetchSignInMethodsForEmail(control.value).then(
            response => response.length ? { emailTaken: true } : null
        )
    }

    registerOnValidatorChange?(fn: () => void): void {
        throw new Error("Method not implemented.");
    }
}
