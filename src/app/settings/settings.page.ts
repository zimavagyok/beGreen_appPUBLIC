import { Component, OnInit } from '@angular/core';
import {radiusSettings} from "../../globalsettings/radiusSettings";
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  radius : number;

  constructor(private menuCtrl: MenuController) { }

  ngOnInit() {
    this.menuCtrl.enable(true);
    this.radius = radiusSettings.getRadius();
  }

  setValue()
  {
    radiusSettings.setRadius(this.radius);
  }

}
