import { FormControl, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { WebAPI } from '../services/webAPI';
import { Observable } from 'rxjs';
import { RegistrationPage } from '../registration/registration.page';
import { map } from 'rxjs/operators';

export class UsernameValidator{
  static async validUsername(fc: FormControl) {
    let isFound : boolean  = false;
    isFound = await WebAPI.Profile.profile_FindUsername(fc.value.toLowerCase()).then(x => x);
    if (isFound) {
      return { validUsername: true };
    } else {
      return null;
    }
  }

}
