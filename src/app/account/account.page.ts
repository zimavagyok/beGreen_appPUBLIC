import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { WebAPI } from '../services/webAPI';
import { ChangeNameRequest } from '../services/clients/profile.client';
import { ChangePasswordRequest, User, UserClient } from '../services/clients/user.client';
import { StorageService } from '../services/clients/storage.service';
import { StorageKeys } from '../settings/constats';
import { MenuController } from '@ionic/angular';


@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  userName: any;
  email: any;

  constructor(public alertCtrl: AlertController, private navCtrl: NavController,
    private menuCtrl: MenuController,
    public toastController: ToastController) { }

  ngOnInit() {
    WebAPI.Profile.profile_GetByID().then(x => this.userName = x.name);
    WebAPI.User.user_GetbyID().then(x => this.email = x.email);
  }

  async toaster(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000
    });
    toast.present();
  }

  async changeUsername() {
    const alert = await this.alertCtrl.create({
      header: 'Change name',
      buttons: [
        'Cancel',
        {
          text: 'Ok',
          handler: async (data: any) => {
            const requestParam: ChangeNameRequest = {
              newName: data.name
            }
            var isFound = await WebAPI.Profile.profile_FindUsername(data.name).then(x => x);
            console.log(isFound);
            if (!isFound) {
              if (!(data.name.length < 3)) {
                if (!(data.name.length > 40)) {
                  if (data.name.match("^[a-zA-Z0-9_-]{3,40}$")) {
                    WebAPI.Profile.profile_NameChange(requestParam).then(x => this.userName = x.name).catch((error) => { });
                  }
                  else {
                    this.toaster("Your username can only contains letters, numbers and underscores.");
                  }
                }
                else {
                  this.toaster("Name cant be longer than 40 characters.");
                }
              }
              else {
                this.toaster("Name must be at least 3 characters long.");
              }
            }
            else {
              this.toaster("Username already exists!");
            }
          }
        }
      ],
      inputs: [
        {
          type: 'text',
          name: 'name',
          placeholder: 'Name'
        }
      ]
    });
    await alert.present();
  }

  async changePassword() {
    const alert = await this.alertCtrl.create({
      header: 'Change password',
      buttons: [
        'Cancel',
        {
          text: 'Ok',
          handler: async (data: any) => {
            const requestParam: ChangePasswordRequest = {
              oldPassword: data.currentpw,
              newPassword: data.newpw
            }
            if (data.currentpw == "" || data.newpw == "" || data.newpw2 == "") {
              this.toaster("All field is required.");
            }
            else {
              var match = await WebAPI.User.user_MatchPassword(data.currentpw).then(x => x).catch((error) => { this.toaster("Something went wrong!"); });
              if (match) {
                if (data.newpw == data.newpw2) {
                  if (data.newpw.length > 3) {
                    if (data.newpw.length < 41) {
                      if (data.newpw.match("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")) {
                        WebAPI.User.user_Update(requestParam).then(
                          x => {
                            if (x != null) {
                              this.menuCtrl.enable(false);
                              const storage: StorageService = new StorageService();
                              storage.clearStorage();
                              this.navCtrl.navigateRoot('/home');
                            }
                          }
                        ).catch((error) => { this.toaster("Something went wrong!"); });
                      }
                      else {
                        this.toaster("Your password must contain at least eight characters, at least one number and both lower and uppercase letters and special characters.");
                      }
                    }
                    else {
                      this.toaster("New password can't be longer than 40 characters.");
                    }
                  }
                  else {
                    this.toaster("New password must be at least 3 characters long.");
                  }
                }
                else {
                  this.toaster("New password and confirmation password don't match.");
                }
              }
              else {
                this.toaster("Current password doesn't match!");
              }
            }
          }
        }
      ],
      inputs: [
        {
          type: 'password',
          name: 'currentpw',
          placeholder: "Current password"
        },
        {
          type: 'password',
          name: 'newpw',
          placeholder: "New password"
        },
        {
          type: 'password',
          name: 'newpw2',
          placeholder: "New password again"
        }
      ]
    });
    await alert.present();
  }
}
