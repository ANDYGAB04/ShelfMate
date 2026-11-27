import {AfterViewInit, Component, inject, OnInit, PLATFORM_ID} from '@angular/core';
import {RouterLink} from '@angular/router';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-menu',
  imports: [
    RouterLink
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const linkColor = document.querySelectorAll('.nav-link');
    linkColor.forEach(link => {
      if (window.location.href.endsWith(link.getAttribute('href') || '')) {
        link.classList.add('active');
      }
      link.addEventListener('click', () => {
        linkColor.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  logout() {

  }
}
