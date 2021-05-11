import { FormControl } from '@angular/forms';
import { WebAPI } from '../services/webAPI';
export class EmailValidator{
  static async validEmail(fc: FormControl) {
    let isFound : boolean  = false;
    isFound = await WebAPI.User.user_FindEmail(fc.value.toLowerCase()).then(x => x);
    if (isFound) {
      return { validEmail: true };
    } else {
      return null;
    }
  }

}