import { Component } from '@angular/core';

@Component({
  selector: 'app-main-footer',
  template: `
    <footer
      class="mt-12 py-6  flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium"
    >
      <span>Powered by</span>
      <img
        src="assets/images/shared/digital-bond-logo.png"
        width="22"
        height="18"
        alt="Digital Bond"
      />
      <span>Digital Bond</span>
    </footer>
  `,
})
export class MainFooterComponent {}
