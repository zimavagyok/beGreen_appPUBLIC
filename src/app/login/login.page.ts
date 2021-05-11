import { Component, OnInit } from '@angular/core';
import { LoginRequest, TokenResponse } from '../services/clients/security.client';
import { WebAPI } from '../services/webAPI';
import { StorageService } from '../services/clients/storage.service';
import { DeviceEntity } from '../services/clients/device.client';
import { NavController, Platform, ToastController } from '@ionic/angular';
import { StorageKeys } from '../settings/constats';
import { MenuController } from '@ionic/angular';
import { Manufacturer } from '../services/clients/manufacturer.client';
import { DeviceProfileConnection } from '../services/clients/deviceprofileconnection.client';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Device } from '@ionic-native/device/ngx';
import { ExtendedDeviceInformation } from '@ionic-native/extended-device-information/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: string = "";
  password: string = "";
  data: LoginRequest;
  constructor(private navCtrl: NavController, private menuCtrl: MenuController, private device: Device, private extendedDeviceInfo: ExtendedDeviceInformation, private platform: Platform, private deviceService: DeviceDetectorService, public toastController: ToastController) { }

  async ngOnInit() {
    this.menuCtrl.enable(false);
    await this.platform.ready();
  }

  async forgotPassword() {
    const toast = await this.toastController.create({
      message: "This function is not available yet.",
      duration: 4000
    });
    toast.present();
  }

  async wrongCredentials() {
    const toast = await this.toastController.create({
      message: "Wrong credentials!",
      duration: 4000
    });
    toast.present();
  }

  login = async (): Promise<void> => {
      this.data =
      {
        email: this.email.trim(),
        password: this.password.trim()
      }

    const token: TokenResponse | void = await WebAPI.Security.login(this.data)
      .then(x => x)
      .catch((error) => {
        this.wrongCredentials();
        return;
      });
      console.log(token);
    if (token) {
      WebAPI.setToken(token.access_token);
      const storage: StorageService = new StorageService();
      storage.write(StorageKeys.JWT, token.access_token);
      this.navCtrl.navigateRoot('dashboard');
    }
  }

}
