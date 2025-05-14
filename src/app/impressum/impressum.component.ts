import { Component } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [MarkdownModule],
  templateUrl: './impressum.component.html',
  styleUrl: './impressum.component.scss'
})
export class ImpressumComponent {
  currentLang: 'en' | 'de' = 'en'

  get markdownSrc(): string {
    return this.currentLang === 'en'
      ? 'assets/legal/impressum.md'
      : 'assets/legal/impressum-de.md';
  }

  get linkLabel(): string {
    return this.currentLang === 'en' ? 'In Deutsch' : 'In English';
  }
  
  toggleLanguage(event: Event) {
    event.preventDefault();
    this.currentLang = this.currentLang === 'en' ? 'de' : 'en';
  }
}
