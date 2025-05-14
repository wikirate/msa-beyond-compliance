import { Component } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [MarkdownModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {

  currentLang: 'en' | 'de' = 'en'

  get markdownSrc(): string {
    return this.currentLang === 'en'
      ? 'assets/legal/privacy-policy.md'
      : 'assets/legal/privacy-policy-de.md';
  }

  get linkLabel(): string {
    return this.currentLang === 'en' ? 'In Deutsch' : 'In English';
  }

  get policyTitle(): string {
    return this.currentLang === 'en' ? 'Privacy Policy' : 'Datenschutzerklärung';
  }
  
  toggleLanguage(event: Event) {
    event.preventDefault();
    this.currentLang = this.currentLang === 'en' ? 'de' : 'en';
  }
}
