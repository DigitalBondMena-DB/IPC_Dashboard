import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  connect(url: string) {
    const eventSource = new EventSource(url);
    eventSource.onmessage = (event) => {
      console.log(event.data);
    };
  }
}
