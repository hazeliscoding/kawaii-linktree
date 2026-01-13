import { Component, signal } from '@angular/core';
import { Home } from './pages/home/home';
import { RouterOutlet } from "../../node_modules/@angular/router/types/_router_module-chunk";

@Component({
  selector: 'app-root',
  imports: [Home, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('kawaii-linktree');
}
