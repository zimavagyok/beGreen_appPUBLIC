import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddnewrecyclingbankPage } from './addnewrecyclingbank.page';

describe('AddnewrecyclingbankPage', () => {
  let component: AddnewrecyclingbankPage;
  let fixture: ComponentFixture<AddnewrecyclingbankPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddnewrecyclingbankPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddnewrecyclingbankPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
