import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, computed, effect, inject, signal, Signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

export interface User {
  email: string;
  firstname: string;
  lastname: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'mentoring-program-starter-kit';
  private httpClient: HttpClient = inject(HttpClient);
  users: Signal<User[]> = toSignal(
    this.httpClient.get<any>('https://fakestoreapi.com/users').pipe(
      map((users) =>
        users.map(
          (user: {
            email: string;
            name: { firstname: string; lastname: string };
          }) => ({
            email: user.email,
            firstname: user.name.firstname,
            lastname: user.name.lastname,
          })
        ))), { initialValue: [] }
  );

  sortOrder: WritableSignal<string> = signal('asc');
  visibleUsers: Signal<User[]> = computed( () => {
    return this.users().sort((a: User, b: User) => {
      return this.sortOrder() === 'asc'
      ? a.email.localeCompare(b.email)
      : b.email.localeCompare(a.email)
    });
  });



  constructor() {
    effect(() => console.log(this.visibleUsers())
    )
    
  }
}
