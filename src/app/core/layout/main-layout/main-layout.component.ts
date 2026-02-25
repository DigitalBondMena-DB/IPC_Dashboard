import { Component } from '@angular/core';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { RouterOutlet } from '@angular/router';
import { MainFooterComponent } from './components/main-footer/main-footer.component';

@Component({
  selector: 'app-main-layout',
  imports: [TopBarComponent, SideBarComponent, RouterOutlet, MainFooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {}
