import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NavController } from '@ionic/angular';
import { StorageService } from '../app/services/clients/storage.service';
import {  MenuController } from '@ionic/angular';
import { Environment } from '@ionic-native/google-maps';
import { Extensions } from './extensions';

const extensions = Extensions;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  navigate : any;
  
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private navCtrl : NavController,
    private menuCtrl: MenuController
  ) {
    this.sideMenu();
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      Environment.setEnv({
        // Api key for your server
        // (Make sure the api key should have Website restrictions for your website domain only)
        'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyAXz_D0MGvJ3_Of5OS-tW7EnsLZO4AbYVw',

        // Api key for local development
        // (Make sure the api key should have Website restrictions for 'http://localhost' only)
        'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyAXz_D0MGvJ3_Of5OS-tW7EnsLZO4AbYVw'
      });
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.menuCtrl.enable(false);
    });
  }

  sideMenu()
  {
    this.navigate =
    [
      {
        title : "Map",
        url   : "/dashboard",
        icon  : "map"
      },
      {
        title : "Account",
        url : "/account",
        icon: "contact"
      },
      {
        title : "Settings",
        url   : "/settings",
        icon  : "settings"
      },
    ]
  }

  logout()
  {
    this.menuCtrl.enable(false);
    const storage : StorageService = new StorageService();
    storage.clearStorage();
    this.navCtrl.navigateRoot('/home');
  }
}
