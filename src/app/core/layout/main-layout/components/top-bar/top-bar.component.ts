import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthService } from '@/core/services/auth.service';

@Component({
  selector: 'app-top-bar',
  imports: [],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  private readonly _AuthService = inject(AuthService);
  username = computed(() => this._AuthService.userData()?.user.name);
}
