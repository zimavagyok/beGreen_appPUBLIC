import { Component, OnInit } from '@angular/core';
import { RegisterUserRequest } from '../services/clients/security.client';
import { WebAPI } from '../services/webAPI';
import { StorageService } from '../services/clients/storage.service';
import { StorageKeys } from '../settings/constats';
import { NavController, Platform, ToastController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { EmailValidator } from '../validators/email.validator';
import { UsernameValidator } from '../validators/username.validator';
import { Manufacturer } from '../services/clients/manufacturer.client';
import { DeviceEntity } from '../services/clients/device.client';
import { DeviceProfileConnection } from '../services/clients/deviceprofileconnection.client';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Device } from '@ionic-native/device/ngx';
import { ExtendedDeviceInformation } from '@ionic-native/extended-device-information/ngx';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  constructor(private navCtrl: NavController, private menuCtrl: MenuController, private formBuilder: FormBuilder, private device: Device, private extendedDeviceInfo: ExtendedDeviceInformation, private platform: Platform, private deviceService: DeviceDetectorService, public toastController: ToastController) { }

  get name() {
    return this.registrationForm.get("name");
  }
  get email() {
    return this.registrationForm.get("email");
  }
  get dob() {
    return this.registrationForm.get("dob");
  }
  get password() {
    return this.registrationForm.get("password");
  }


  public errorMessages = {
    name: [
      { type: 'required', message: 'Name is required' },
      { type: 'maxlength', message: 'Name cant be longer than 40 characters' },
      { type: 'minlength', message: 'Name must be at least 3 characters long.' },
      { type: 'pattern', message: 'Your username can only contains letters, numbers and underscores.' },
      { type: 'validUsername', message: 'Your username has already been taken.' }
    ],
    email: [
      { type: 'required', message: 'Email is required' },
      { type: 'minLength', message: 'Email address must be at least 3 characters long.' },
      { type: 'pattern', message: 'Please enter a valid email address' },
      { type: 'validEmail', message: 'Your email has already been taken.' }
    ],
    dob: [
      { type: 'required', message: 'Date of Birth is required' }
    ],
    password: [
      { type: 'required', message: 'Password is required' },
      { type: 'maxlength', message: 'Password cant be longer than 100 characters' },
      { type: 'minlength', message: 'Password must be at least 3 characters long.' },
      { type: 'pattern', message: 'Your password must contain at least eight characters, at least one number and both lower and uppercase letters and special characters.' }
    ]
  };

  registrationForm = this.formBuilder.group(
    {
      email: ['', Validators.compose(
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
        ]
      ),
        EmailValidator.validEmail
      ],
      dob: ['', Validators.required],
      password: ['', Validators.compose(
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
          Validators.pattern("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
        ]
      )],
      name: ['', Validators.compose(
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(40),
          Validators.pattern("^[a-zA-Z0-9_-]{3,40}$")
        ]
      ),
        UsernameValidator.validUsername
      ]
    }
  );

  register() {
    const data: RegisterUserRequest =
    {
      email: this.registrationForm.controls.email.value.trim(),
      dob: this.registrationForm.controls.dob.value,
      password: this.registrationForm.controls.password.value.trim(),
      name: this.registrationForm.controls.name.value.trim()
    }
    const token = WebAPI.Security.registerVisitor(data).then(async x => {
      WebAPI.setToken(x.access_token);
      const storage: StorageService = new StorageService();
      storage.write(StorageKeys.JWT, x.access_token);
      this.navCtrl.navigateRoot('dashboard');
    });
  }

  async ngOnInit() {
    this.menuCtrl.enable(false);
    await this.platform.ready();
  }

}
