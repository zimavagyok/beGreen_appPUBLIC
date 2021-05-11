import { Component, OnInit } from '@angular/core';
import { StorageService } from '../services/clients/storage.service';
import { StorageKeys } from '../settings/constats';
import { NavController, Platform, AlertController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import { Device } from '@ionic-native/device/ngx';
import { ExtendedDeviceInformation } from '@ionic-native/extended-device-information/ngx';
import { DeviceEntity } from '../services/clients/device.client';
import { WebAPI } from '../services/webAPI';
import { Manufacturer } from '../services/clients/manufacturer.client';
import { DeviceDetectorService } from 'ngx-device-detector';
import { radiusSettings } from 'src/globalsettings/radiusSettings';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(private navCtrl: NavController, private menuCtrl: MenuController, private device: Device, private extendedDeviceInfo: ExtendedDeviceInformation, private platform: Platform, private deviceService: DeviceDetectorService,private diagnostic: Diagnostic,public alertCtrl: AlertController) { }

  async ngOnInit() {
    await this.platform.ready().then(()=>{
      this.diagnostic.getLocationMode()
        .then(async (state) => {
          if (state == this.diagnostic.locationMode.LOCATION_OFF) {
            let confirm = await this.alertCtrl.create({
              header: 'Location',
              message: 'Location information is unavaliable on this device. Go to Settings to enable Location for Untapped.',
              backdropDismiss: false,
              buttons: [

                {
                  text: 'GO TO SETTINGS',
                  handler: () => {
                    this.diagnostic.switchToLocationSettings();

                  }
                }
              ]
            });
            confirm.present();
          }
        }).catch(e => console.error(e));
      }
    );
    /*let manufact: Manufacturer =
    {
      id: 0,
      name: this.device.manufacturer
    };
    await WebAPI.Manufacturer.manufacturer_GetByID(manufact.name).then(x => {
      if (x) {
        manufact.id = x.id;
      }
    });
    if (manufact.id === 0) {
      await WebAPI.Manufacturer.manufacturer_Create(manufact).then(x => {
        if (x) {
          manufact.id = x.id;
        }
      });
    }

    console.log(+this.extendedDeviceInfo.memory.toFixed(0));
    const dev: DeviceEntity = {
      id: this.device.uuid,
      manufacturerID: manufact.id,
      ram: 8,
      model: this.device.model,
      screenSize: Math.sqrt(Math.pow(this.platform.width(), 2) + Math.pow(this.platform.height(), 2)),
      operatingSystem: this.device.version + " : " + this.device.platform
    };

    var deviceId = null;
    await WebAPI.Device.device_GetByID(dev.id).then(x => {
      if (x) {
        deviceId = x.id;
      }
    });
    if (deviceId == null) {
      await WebAPI.Device.device_Create(dev).then(x => {
        if (x) {
          deviceId = x.id;
        }
      });
    }*/

    radiusSettings.setRadius(5);

    this.menuCtrl.enable(false);
    const storage: StorageService = new StorageService();
    if (storage.read(StorageKeys.JWT) != null) {
      this.navCtrl.navigateRoot('dashboard');
    };
  }
}

