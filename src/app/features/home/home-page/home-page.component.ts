import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  LucideAngularModule,
  Users,
  Building2,
  Network,
  Settings2,
  Hospital,
} from 'lucide-angular';

interface StatCard {
  label: string;
  value: string;
  type: 'large' | 'small';
  theme: string;
  id: string;
  icon: any;
  illustration?: string;
}

@Component({
  selector: 'app-home-page',
  imports: [LucideAngularModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  statsCards = signal<StatCard[]>([
    {
      id: 'total-users',
      label: 'Total Users',
      value: '40,689',
      type: 'large',
      theme: 'bg-stats-1',
      icon: Users,
    },
    {
      id: 'total-divisions',
      label: 'Total Divisions',
      value: '40,689',
      type: 'large',
      theme: 'bg-stats-2',
      icon: Building2,
    },
    {
      id: 'total-health-directorates',
      label: 'Total Health Directorates',
      value: '40,689',
      type: 'small',
      theme: 'bg-stats-3',
      icon: Network,
    },
    {
      id: 'health-management',
      label: 'Health Management',
      value: '40,689',
      type: 'small',
      theme: 'bg-stats-4',
      icon: Settings2,
    },
    {
      id: 'total-hospitals',
      label: 'Total Hospitals',
      value: '40,689',
      type: 'small',
      theme: 'bg-stats-5',
      icon: Hospital,
    },
  ]);
}
