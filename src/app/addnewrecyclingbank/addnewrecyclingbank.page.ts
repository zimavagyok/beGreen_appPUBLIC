import { Component, OnInit } from '@angular/core';
import {
  ToastController,
  Platform,
  LoadingController
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
  LocationService
} from '@ionic-native/google-maps';
import { MenuController } from '@ionic/angular';
import { WebAPI } from '../services/webAPI';
import { RecyclingBankRequest, RecyclingBank } from '../services/clients/recyclingbank.client';
import { radiusSettings } from 'src/globalsettings/radiusSettings';


@Component({
  selector: 'app-addnewrecyclingbank',
  templateUrl: './addnewrecyclingbank.page.html',
  styleUrls: ['./addnewrecyclingbank.page.scss'],
})
export class AddnewrecyclingbankPage{

  currentLocation: any;
  map: GoogleMap;
  loading: any;
  constructor(public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private platform: Platform,
    private menuCtrl: MenuController,
    public toastController: ToastController) { }

  async ionViewWillEnter() {
    this.menuCtrl.enable(true);
    await this.platform.ready();
    await this.loadMap();

    let marker: Marker = await this.map.addMarker({
      //title: '<b>Current position<b>',
      position: this.currentLocation,
      animation: GoogleMapsAnimation.BOUNCE,
      icon: {
        url: "src/assets/images/standing-up-man-.svg",
        size:
        {
          width: 50,
          height: 50
        }
      },
      disableAutoPan: true,
      zIndex: 1
    });

    const data: RecyclingBankRequest =
    {
      coordinate: this.currentLocation.lat + "," + this.currentLocation.lng,
      radius: radiusSettings.getRadius()
    }

    const recyclingBanks: RecyclingBank[] = await WebAPI.RecyclingBank.recyclingBank_GetAllClose(data).then(x => x);

    if (recyclingBanks.length == 0) {
      await this.presentEmpty();
    }
    else
    {
      for(let i = 0;i<recyclingBanks.length;i++)
      {
        
        this.presentRecyclingBank(recyclingBanks[i]);
      }
    }
  }

  ionViewDidLeave(){
    this.map.remove();
}

    async presentRecyclingBank(recyclingbank : RecyclingBank)
    {
      let marker: Marker = await this.map.addMarker({
        title: '<b>Recycling Bank<b>',
        snippet: "\n<table><tr><td>Capacity:</td><td>      </td><td>"+recyclingbank.capacity+" L</td></tr><tr><td>Plastic:</td><td>      </td><td>"+(recyclingbank.plastic == true ? "<img src='src/assets/images/checkmark-outline.svg' style='height:10px;width:10px'>"  : "<img src='src/assets/images/close-outline.svg' style='height:10px;width:10px'>") +"</td></tr><tr><td>Paper:</td><td>      </td><td>"+(recyclingbank.paper == true ? "<img src='src/assets/images/checkmark-outline.svg' style='height:10px;width:10px'>"  : "<img src='src/assets/images/close-outline.svg' style='height:10px;width:10px'>") +"</td></tr><tr><td>White Glass:</td><td>      </td><td>"+(recyclingbank.whiteGlass == true ? "<img src='src/assets/images/checkmark-outline.svg' style='height:10px;width:10px'>"  : "<img src='src/assets/images/close-outline.svg' style='height:10px;width:10px'>") +"</td></tr><tr><td>Coloured Glass:</td><td>      </td><td>"+(recyclingbank.colouredGlass == true ? "<img src='src/assets/images/checkmark-outline.svg' style='height:10px;width:10px'>"  : "<img src='src/assets/images/close-outline.svg' style='height:10px;width:10px'>") +"</td></tr><tr><td>Metal:</td><td>      </td><td>"+(recyclingbank.metal == true ? "<img src='src/assets/images/checkmark-outline.svg' style='height:10px;width:10px'>"  : "<img src='src/assets/images/close-outline.svg' style='height:10px;width:10px'>") +"</td></tr></table>",
        position: 
        {
          lat : parseFloat(recyclingbank.position.split(',')[0]),
          lng : parseFloat(recyclingbank.position.split(',')[1])
        },
        animation: GoogleMapsAnimation.BOUNCE,
        icon: {
          url: "src/assets/images/recyclingbin.png",
          size:
          {
            width: 30,
            height: 40
          }
        },
        disableAutoPan: true,
        zIndex: 0
      });
    }

    async presentEmpty()
    {
      const toast = await this.toastController.create({
        message: 'We could not found any recycling bank in your area.',
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
        API_KEY_FOR_BROWSER_RELEASE: 'AIzaSyAHwCRpMu0rCsWsm-kHzU5QYxPzS55EkJ8',
        API_KEY_FOR_BROWSER_DEBUG: 'AIzaSyAHwCRpMu0rCsWsm-kHzU5QYxPzS55EkJ8'
      });

      const data : MyLocation =await LocationService.getMyLocation().then(x=>x);
      let mapOptions: GoogleMapOptions = {
        camera: {
          target: data.latLng,
          zoom: 18,
          tilt: 30
        },
        controls: {
          myLocation: true,
          myLocationButton: false
        }
      };

      this.map = GoogleMaps.create('map_canvas', mapOptions);

      await this.getLocation().then(x => { this.currentLocation = x });
    }

    /*async onButtonClick() {
      this.map.clear();
  
      this.loading = await this.loadingCtrl.create({
        message: 'Please wait...'
      });
      await this.loading.present();
  
      // Get the location of you
      this.map.getMyLocation().then((location: MyLocation) => {
        this.loading.dismiss();
        console.log(JSON.stringify(location, null , 2));
  
        // Move the map camera to the location with animation
        this.map.animateCamera({
          target: location.latLng,
          zoom: 17,
          tilt: 30
        });
  
        // add a marker
        let marker: Marker = this.map.addMarkerSync({
          title: '@ionic-native/google-maps plugin!',
          snippet: 'This plugin is awesome!',
          position: location.latLng,
          animation: GoogleMapsAnimation.BOUNCE
        });
  
        // show the infoWindow
        marker.showInfoWindow();
  
        // If clicked it, display the alert
        marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
          this.showToast('clicked!');
        });
      })
      .catch(err => {
        this.loading.dismiss();
        this.showToast(err.error_message);
      });
    }
  
    async showToast(message: string) {
      let toast = await this.toastCtrl.create({
        message: message,
        duration: 2000,
        position: 'middle'
      });
  
      toast.present();
    }*/

}
