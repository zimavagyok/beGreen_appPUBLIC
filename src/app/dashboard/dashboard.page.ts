import { Component, OnInit, ElementRef, ChangeDetectorRef, DoCheck, ViewChild } from '@angular/core';
import {
  ToastController,
  Platform,
  LoadingController,
  AlertController,
  NavController
} from '@ionic/angular';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  Marker,
  GoogleMapsAnimation,
  MyLocation,
  Environment,
  GoogleMapOptions,
  LatLng,
  LocationService,
  HtmlInfoWindow,
  Polyline
} from '@ionic-native/google-maps';
import { MenuController } from '@ionic/angular';
import { WebAPI } from '../services/webAPI';
import { RecyclingBankRequest, RecyclingBank, RecyclingBankCreateRequest } from '../services/clients/recyclingbank.client';
import { radiusSettings } from 'src/globalsettings/radiusSettings';
import { isAdmin } from '../services/clients/roleService';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { StorageService } from '../services/clients/storage.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Like } from '../services/clients/like.client';
import { error } from 'protractor';
import {GoogleMapsClient} from '@google/maps';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements DoCheck {
  google : GoogleMapsClient;
  map: any;
  currentLocation: any;
  loading: any;
  longClick = GoogleMapsEvent.MAP_LONG_CLICK;
  showAlert: boolean = false;
  selectedMarker: string;
  permissionStatus: {
    GRANTED: string;
    DENIED: string;
    NOT_REQUESTED: string;
    DENIED_ALWAYS: string;
    RESTRICTED: string;
    GRANTED_WHEN_IN_USE: string;
  };

  constructor(public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private platform: Platform,
    private menuCtrl: MenuController,
    public toastController: ToastController,
    public alertCtrl: AlertController,
    private cdRef: ChangeDetectorRef,
    private elementRef: ElementRef,
    private diagnostic: Diagnostic,
    private navCtrl: NavController,
    private androidPermissions: AndroidPermissions) { }

  async ionViewWillEnter() {
    await this.platform.ready();
    this.menuCtrl.enable(true);
    //------------
    this.diagnostic.getLocationMode()
      .then(async (state) => {
        if (state == this.diagnostic.locationMode.LOCATION_OFF) {
          let confirm = await this.alertCtrl.create({
            header: 'Location',
            message: 'Location information is unavaliable on this device. You will be logged out.',
            backdropDismiss: false,
            buttons: [

              {
                text: 'OK',
                handler: () => {
                  this.menuCtrl.enable(false);
                  const storage: StorageService = new StorageService();
                  storage.clearStorage();
                  this.navCtrl.navigateRoot('/home');
                }
              }
            ]
          });
          confirm.present();
        }
      }).catch(e => console.error(e));

    let permissionStatus = this.diagnostic.permissionStatus;
    this.diagnostic.getLocationAuthorizationStatus()
      .then(async (state) => {
        switch (state) {
          case permissionStatus.GRANTED_WHEN_IN_USE:
            break;
          case permissionStatus.GRANTED:
            break;
          case permissionStatus.DENIED:
            {
              this.diagnostic.requestLocationAuthorization();
              let confirm = await this.alertCtrl.create({
                header: 'Warning',
                message: 'Location information is unavaliable on this device. In this case map can not be loaded.',
                backdropDismiss: false,
                buttons: [
                  { text: 'OK' },
                  {
                    text: 'Turn on',
                    handler: () => {
                      this.diagnostic.requestLocationAuthorization();
                      this.diagnostic.switchToSettings();
                    }
                  }
                ]
              });
              confirm.present();
            }
            break;
          case permissionStatus.DENIED_ALWAYS:
            {
              this.diagnostic.requestLocationAuthorization();
              let confirm = await this.alertCtrl.create({
                header: 'Warning',
                message: 'Location information is unavaliable on this device. In this case map can not be loaded.',
                backdropDismiss: false,
                buttons: [
                  { text: 'OK' },
                  {
                    text: 'Turn on',
                    handler: () => {
                      this.diagnostic.switchToSettings();
                    }
                  }
                ]
              });
              confirm.present();
            }
            break;
          case permissionStatus.NOT_REQUESTED:
            {
              let confirm = await this.alertCtrl.create({
                header: 'Warning',
                message: 'You have to enable location, else the map can not be loaded.',
                backdropDismiss: false,
                buttons: [
                  { text: 'OK' }
                ]
              });
              confirm.present();
            }
        }
      }).catch(e => console.error(e));
    //---------------
    await this.loadMap();


    this.map.on(this.longClick).subscribe(async (data) => {
      var locate = data[0].lat + "," + data[0].lng;
      await this.presentCapacity(locate);
    });

    const data: RecyclingBankRequest =
    {
      coordinate: this.currentLocation.lat + "," + this.currentLocation.lng,
      radius: radiusSettings.getRadius()
    };

    const recyclingBanks: RecyclingBank[] = await WebAPI.RecyclingBank.recyclingBank_GetAllClose(data).then(x => x);

    if (recyclingBanks.length == 0) {
      await this.presentEmpty();
    }
    else {
      console.log('recyclingBanks: ', recyclingBanks);
      for (let i = 0; i < recyclingBanks.length; i++) {

        this.presentRecyclingBank(recyclingBanks[i]);
      }

    }
    
    this.cdRef.detectChanges();
    var el = this.elementRef.nativeElement.querySelector('.deleteButton');
    if (el && !this.showAlert) {
      el.addEventListener('click', this.presentEmpty.bind(this));
      this.showAlert = true;
    }

  }

  ngDoCheck() {
    this.cdRef.detectChanges();

  }

  async deleteRecyclingBank(location, marker) {
    const isDeleted = await WebAPI.RecyclingBank.recyclingBank_Delete(location).then(x => x);
    if (isDeleted) {
      marker.remove();
      this.successDelete();
    }
    else {
      this.error();
    }
  }

  ionViewDidLeave() {
    this.map.remove();
  }

  async presentTypes(Location, Capacity) {
    const alert = await this.alertCtrl.create({
      header: 'Information about recycling bank',
      backdropDismiss: false,
      inputs: [
        {
          name: 'plastic',
          type: 'checkbox',
          label: 'Plastic',
          value: 'plastic'
        },

        {
          name: 'paper',
          type: 'checkbox',
          label: 'Paper',
          value: 'paper'
        },

        {
          name: 'whiteGlass',
          type: 'checkbox',
          label: 'White Glass',
          value: 'whiteGlass'
        },

        {
          name: 'colouredGlass',
          type: 'checkbox',
          label: 'Coloured Glass',
          value: 'colouredGlass'
        },

        {
          name: 'metal',
          type: 'checkbox',
          label: 'Metal',
          value: 'metal'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {

          }
        }, {
          text: 'Ok',
          handler: async (data: any) => {
            if (data.length != 0) {
              const recyclingbank: RecyclingBankCreateRequest = {
                capacity: parseInt(Capacity),
                position: Location,
                plastic: data.includes("plastic") ? true : false,
                metal: data.includes("metal") ? true : false,
                paper: data.includes("paper") ? true : false,
                whiteGlass: data.includes("whiteGlass") ? true : false,
                colouredGlass: data.includes("colouredGlass") ? true : false,
              }

              const bin: RecyclingBank | undefined = await WebAPI.RecyclingBank.recyclingBank_Create(recyclingbank).then(x => x);
              if (bin != null || bin != undefined) {
                this.presentRecyclingBank(bin);
                this.success();
              }
              else {
                this.fail();
              }
            }
            else {
              this.empty();
            }

          }
        }
      ]
    });
    await alert.present();
  }

  async presentCapacity(location) {
    const alert = await this.alertCtrl.create({
      header: 'Information about recycling bank',
      backdropDismiss: false,
      inputs: [
        {
          type: 'number',
          name: 'capacity',
          placeholder: 'Capacity in liter',
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {

          }
        }, {
          text: 'Ok',
          handler: (data: any) => {
            if (parseInt(data.capacity) > 1000 || parseInt(data.capacity) < 1) {
              this.invalid();
            }
            else {
              this.presentTypes(location, data.capacity);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async likeMarker(recyclingbank: RecyclingBank, marker, infoWindow: HtmlInfoWindow) {
    let likeEntity: Like =
    {
      recyclingBankId: recyclingbank.id
    }
    let result = await WebAPI.Like.like_GetByBoth(likeEntity).then(x => x) == null ? true : false;
    if (result) {
      let newId = await WebAPI.Like.like_Create(likeEntity).then(x => x.id).catch((error) => { });
      if (newId > 0) {
        result = await WebAPI.Like.like_GetByBoth(likeEntity).then(x => x) == null ? true : false;
        let count = await WebAPI.Like.like_Count(recyclingbank.id).then(x => x);
        let frame: HTMLElement = document.createElement('div');
        frame.innerHTML = "<h2 style='margin-left:15px;'>Recycling Bank</h2><div><table class='snippet' style='margin-left:25px;'><tr><td>Capacity:</td><td>" + recyclingbank.capacity + " L</td></tr><tr><td>Plastic:</td><td>" + (recyclingbank.plastic == true ? "<img src='/assets/images/checkmark-outline.svg' style='height:20px;width:20px'>" : "<img src='/assets/images/close-outline.svg' style='height:20px;width:20px'>") + "</td></tr><tr><td>Paper:</td><td>" + (recyclingbank.paper == true ? "<img src='/assets/images/checkmark-outline.svg' style='height:20px;width:20px'>" : "<img src='/assets/images/close-outline.svg' style='height:20px;width:20px'>") + "</td></tr><tr><td>White Glass:</td><td>" + (recyclingbank.whiteGlass == true ? "<img src='/assets/images/checkmark-outline.svg' style='height:20px;width:20px'>" : "<img src='/assets/images/close-outline.svg' style='height:20px;width:20px'>") + "</td></tr><tr><td>Coloured Glass:</td><td>" + (recyclingbank.colouredGlass == true ? "<img src='/assets/images/checkmark-outline.svg' style='height:20px;width:20px'>" : "<img src='/assets/images/close-outline.svg' style='height:20px;width:20px'>") + "</td></tr><tr><td>Metal:</td><td>" + (recyclingbank.metal == true ? "<img src='/assets/images/checkmark-outline.svg' style='height:20px;width:20px'>" : "<img src='/assets/images/close-outline.svg' style='height:20px;width:20px'>") + "</td></tr>" + (isAdmin() ? "<tr><td><button style='background: transparent;border: 1px solid #f00;border-radius: 2em;color: #f00;display: inline-block;font-size: 20px;height: 30px;line-height: 2px;margin: 0 0 8px;text-align: center;width: 30px;' class='deleteButton'>-</button></td><td>" + (result ? "<button class='likeButton' style='background-color:white;'><ion-icon name='heart' style='color:grey; font-size: 2em'></ion-icon><br>" + count + "</button>" : "<button class='likeButton' style='background-color:white;'><ion-icon name='heart' style='color:red; font-size: 2em'></ion-icon><br>" + count + "</button>") + "</td></tr>" : (result ? "<tr><td style='text-align:center;'><button class='likeButton' style='background-color:white; margin-left:35px;'><ion-icon name='heart' style='color:grey; font-size: 2em'></ion-icon><br>" + count + "</button></td></tr>" : "<tr><td style='text-align:center;'><button class='likeButton' style='background-color:white; margin-left:35px;'><ion-icon name='heart' class='heartIcon' style='color:red; font-size: 2em'></ion-icon><br>" + count + "</button></td></tr>")) + "</table></div>";

        infoWindow.setContent(frame, { width: "200px", height: "248px" });

        marker.removeEventListener();

        marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
          infoWindow.open(marker);
        });

        if (isAdmin()) {
          marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
            setTimeout(() => {
              var snippet = this.elementRef.nativeElement.querySelector('.snippet');
              if (snippet) {
                var el = this.elementRef.nativeElement.querySelector('.deleteButton');
                el.addEventListener('click', this.deleteRecyclingBank.bind(this, recyclingbank.position, marker));
              }
            }, 100)
          });
        }

        marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
          setTimeout(() => {
            var snippet = this.elementRef.nativeElement.querySelector('.snippet');
            if (snippet) {
              var el = this.elementRef.nativeElement.querySelector('.likeButton');
              el.addEventListener('click', this.dislikeMarker.bind(this, recyclingbank, marker, infoWindow));
            }
          }, 100)
        });
      }
      else {
        this.error();
      }
    }
  }
  async dislikeMarker(recyclingbank: RecyclingBank, marker, infoWindow: HtmlInfoWindow) {
    let likeEntity: Like =
    {
      recyclingBankId: recyclingbank.id
    }
    let result = await WebAPI.Like.like_GetByBoth(likeEntity).then(x => x) == null ? true : false;
    if (!result) {
      let success = await WebAPI.Like.like_DeleteByBoth(likeEntity).then(x => x).catch((error) => { });
      if (success == true) {
        result = await WebAPI.Like.like_GetByBoth(likeEntity).then(x => x) == null ? true : false;
        let count = await WebAPI.Like.like_Count(recyclingbank.id).then(x => x);
        let frame: HTMLElement = document.createElement('div');
        frame.innerHTML = "<h2 style='margin-left:15px;'>Recycling Bank</h2><div><table class='snippet' style='margin-left:25px;'><tr><td>Capacity:</td><td>" + recyclingbank.capacity + " L</td></tr><tr><td>Plastic:</td><td>" + (recyclingbank.plastic == true ? "<img src='/assets/images/checkmark-outline.svg' style='height:20px;width:20px'>" : "<img src='/assets/images/close-outline.svg' style='height:20px;width:20px'>") + "</td></tr><tr><td>Paper:</td><td>" + (recyclingbank.paper == true ? "<img src='/assets/images/checkmark-outline.svg' style='height:20px;width:20px'>" : "<img src='/assets/images/close-outline.svg' style='height:20px;width:20px'>") + "</td></tr><tr><td>White Glass:</td><td>" + (recyclingbank.whiteGlass == true ? "<img src='/assets/images/checkmark-outline.svg' style='height:20px;width:20px'>" : "<img src='/assets/images/close-outline.svg' style='height:20px;width:20px'>") + "</td></tr><tr><td>Coloured Glass:</td><td>" + (recyclingbank.colouredGlass == true ? "<img src='/assets/images/checkmark-outline.svg' style='height:20px;width:20px'>" : "<img src='/assets/images/close-outline.svg' style='height:20px;width:20px'>") + "</td></tr><tr><td>Metal:</td><td>" + (recyclingbank.metal == true ? "<img src='/assets/images/checkmark-outline.svg' style='height:20px;width:20px'>" : "<img src='/assets/images/close-outline.svg' style='height:20px;width:20px'>") + "</td></tr>" + (isAdmin() ? "<tr><td><button style='background: transparent;border: 1px solid #f00;border-radius: 2em;color: #f00;display: inline-block;font-size: 20px;height: 30px;line-height: 2px;margin: 0 0 8px;text-align: center;width: 30px;' class='deleteButton'>-</button></td><td>" + (result ? "<button class='likeButton' style='background-color:white;'><ion-icon name='heart' style='color:grey; font-size: 2em'></ion-icon><br>" + count + "</button>" : "<button class='likeButton' style='background-color:white;'><ion-icon name='heart' style='color:red; font-size: 2em'></ion-icon><br>" + count + "</button>") + "</td></tr>" : (result ? "<tr><td style='text-align:center;'><button class='likeButton' style='background-color:white; margin-left:35px;'><ion-icon name='heart' style='color:grey; font-size: 2em'></ion-icon><br>" + count + "</button></td></tr>" : "<tr><td style='text-align:center;'><button class='likeButton' style='background-color:white; margin-left:35px;'><ion-icon name='heart' class='heartIcon' style='color:red; font-size: 2em'></ion-icon><br>" + count + "</button></td></tr>")) + "</table></div>";

        infoWindow.setContent(frame, { width: "200px", height: "248px" });

        marker.removeEventListener();

        marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
          infoWindow.open(marker);
        });

        if (isAdmin()) {
          marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
            setTimeout(() => {
              var snippet = this.elementRef.nativeElement.querySelector('.snippet');
              if (snippet) {
                var el = this.elementRef.nativeElement.querySelector('.deleteButton');
                el.addEventListener('click', this.deleteRecyclingBank.bind(this, recyclingbank.position, marker));
              }
            }, 100)
          });
        }

        marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
          setTimeout(() => {
            var snippet = this.elementRef.nativeElement.querySelector('.snippet');
            if (snippet) {
              var el = this.elementRef.nativeElement.querySelector('.likeButton');
              el.addEventListener('click', this.likeMarker.bind(this, recyclingbank, marker, infoWindow));
            }
          }, 100)
        });
      }
      else {
        this.error();
      }
    }
  }

  async presentRecyclingBank(recyclingbank: RecyclingBank) {
    const [la, ln] = recyclingbank.position.split(',');
    const lat = parseFloat(la);
    const lng = parseFloat(ln);

    let likeEntity: Like =
    {
      recyclingBankId: recyclingbank.id
    }
    let result = await WebAPI.Like.like_GetByBoth(likeEntity).then(x => x) == null ? true : false;
    console.log(result);
    let count = await WebAPI.Like.like_Count(recyclingbank.id).then(x => x);

    let htmlInfoWindow = new HtmlInfoWindow();

    let frame: HTMLElement = document.createElement('div');
    frame.innerHTML = "<h2 style='margin-left:15px;'>Recycling Bank</h2><div><table class='snippet' style='margin-left:25px;'><tr><td>Capacity:</td><td>" + recyclingbank.capacity + " L</td></tr><tr><td>Plastic:</td><td>" + (recyclingbank.plastic == true ? "<img src='/assets/images/checkmark-outline.svg' style='height:20px;width:20px'>" : "<img src='/assets/images/close-outline.svg' style='height:20px;width:20px'>") + "</td></tr><tr><td>Paper:</td><td>" + (recyclingbank.paper == true ? "<img src='/assets/images/checkmark-outline.svg' style='height:20px;width:20px'>" : "<img src='/assets/images/close-outline.svg' style='height:20px;width:20px'>") + "</td></tr><tr><td>White Glass:</td><td>" + (recyclingbank.whiteGlass == true ? "<img src='/assets/images/checkmark-outline.svg' style='height:20px;width:20px'>" : "<img src='/assets/images/close-outline.svg' style='height:20px;width:20px'>") + "</td></tr><tr><td>Coloured Glass:</td><td>" + (recyclingbank.colouredGlass == true ? "<img src='/assets/images/checkmark-outline.svg' style='height:20px;width:20px'>" : "<img src='/assets/images/close-outline.svg' style='height:20px;width:20px'>") + "</td></tr><tr><td>Metal:</td><td>" + (recyclingbank.metal == true ? "<img src='/assets/images/checkmark-outline.svg' style='height:20px;width:20px'>" : "<img src='/assets/images/close-outline.svg' style='height:20px;width:20px'>") + "</td></tr>" + (isAdmin() ? "<tr><td><button style='background: transparent;border: 1px solid #f00;border-radius: 2em;color: #f00;display: inline-block;font-size: 20px;height: 30px;line-height: 2px;margin: 0 0 8px;text-align: center;width: 30px;' class='deleteButton'>-</button></td><td>" + (result ? "<button class='likeButton' style='background-color:white;'><ion-icon name='heart' style='color:grey; font-size: 2em'></ion-icon><br>" + count + "</button>" : "<button class='likeButton' style='background-color:white;'><ion-icon name='heart' style='color:red; font-size: 2em'></ion-icon><br>" + count + "</button>") + "</td></tr>" : (result ? "<tr><td style='text-align:center;'><button class='likeButton' style='background-color:white; margin-left:35px;'><ion-icon name='heart' style='color:grey; font-size: 2em'></ion-icon><br>" + count + "</button></td></tr>" : "<tr><td style='text-align:center;'><button class='likeButton' style='background-color:white; margin-left:35px;'><ion-icon name='heart' class='heartIcon' style='color:red; font-size: 2em'></ion-icon><br>" + count + "</button></td></tr>")) + "</table></div>";
    htmlInfoWindow.setContent(frame, { width: "200px", height: "248px" });

    let marker: Marker = await this.map.addMarker({
      position:
      {
        lat,
        lng
      },
      animation: GoogleMapsAnimation.BOUNCE,
      icon: {
        url: "http://localhost:8100/assets/images/recyclingbin.png",
        size:
        {
          width: 20,
          height: 30
        }
      },
      disableAutoPan: true,
      zIndex: 1
    });

    marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
      htmlInfoWindow.open(marker);
    });
    if (result) {
      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        setTimeout(() => {
          var snippet = this.elementRef.nativeElement.querySelector('.snippet');
          if (snippet) {
            var el = this.elementRef.nativeElement.querySelector('.likeButton');
            el.addEventListener('click', this.likeMarker.bind(this, recyclingbank, marker, htmlInfoWindow));
          }
        }, 100)
      });
    }
    else {
      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        setTimeout(() => {
          var snippet = this.elementRef.nativeElement.querySelector('.snippet');
          if (snippet) {
            var el = this.elementRef.nativeElement.querySelector('.likeButton');
            el.addEventListener('click', this.dislikeMarker.bind(this, recyclingbank, marker, htmlInfoWindow));
          }
        }, 100)
      });
    }

    if (isAdmin()) {
      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        setTimeout(() => {
          var snippet = this.elementRef.nativeElement.querySelector('.snippet');
          if (snippet) {
            var el = this.elementRef.nativeElement.querySelector('.deleteButton');
            el.addEventListener('click', this.deleteRecyclingBank.bind(this, recyclingbank.position, marker));
          }
        }, 100)
      });
    }
  }

  async successDelete() {
    const toast = await this.toastController.create({
      message: 'You have successfully deleted a recycling bank.',
      duration: 4000
    });
    toast.present();
  }

  async error() {
    const toast = await this.toastController.create({
      message: 'Something went wrong!',
      duration: 4000
    });
    toast.present();
  }

  async presentEmpty() {
    const toast = await this.toastController.create({
      message: 'We could not found any recycling bank in your area.',
      duration: 4000
    });
    toast.present();
  }

  async success() {
    const toast = await this.toastController.create({
      message: 'You have sucessfully added a new recycling bank.',
      duration: 4000
    });
    toast.present();
  }

  async invalid() {
    const toast = await this.toastController.create({
      message: 'You have given invalid data.',
      duration: 4000
    });
    toast.present();
  }

  async fail() {
    const toast = await this.toastController.create({
      message: 'Something went wrong!',
      duration: 4000
    });
    toast.present();
  }

  async empty() {
    const toast = await this.toastController.create({
      message: 'You have to select at least one type!',
      duration: 4000
    });
    toast.present();
  }

  getLocation = async () => {
    const data: MyLocation = await LocationService.getMyLocation().then(x => x);
    return data.latLng;
  }

  async loadMap() {
    Environment.setEnv({
      API_KEY_FOR_BROWSER_RELEASE: '',
      API_KEY_FOR_BROWSER_DEBUG: ''
    });

    const data: MyLocation = await LocationService.getMyLocation().then(x => x);
    let mapOptions: GoogleMapOptions = {
      camera: {
        target: data.latLng,
        zoom: 10,
        tilt: 30
      },
      controls: {
        myLocation: true,
        compass: false
      }
    };

    this.map = GoogleMaps.create('map_canvas', mapOptions);
    await this.getLocation().then(x => { this.currentLocation = x });
  }
}