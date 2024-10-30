import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  Component,
  computed,
  inject,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, NgClass, FormsModule],
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
            id: number;
            email: string;
            name: { firstname: string; lastname: string };
          }) => ({
            id: user.id,
            email: user.email,
            firstname: user.name.firstname,
            lastname: user.name.lastname,
          })
        )
      )
    ),
    { initialValue: [] }
  );

  sortBy: WritableSignal<string> = signal('email');
  sortOrder: WritableSignal<string> = signal('asc');
  filterEmail: WritableSignal<string> = signal('');
  isDetailsVisible: WritableSignal<boolean> = signal(false);
  userId: WritableSignal<number> = signal(0);

  visibleUsers: Signal<User[]> = computed(() => {
    const filteredUsers = this.users().filter((user: User) => {
      return user.email
        .toLowerCase()
        .includes(this.filterEmail().toLowerCase());
    });

    return filteredUsers.sort((a: User, b: User) => {
      if (this.sortBy() === 'email' && this.sortOrder() === 'asc') {
        return a.email.localeCompare(b.email);
      }
      if (this.sortBy() === 'email' && this.sortOrder() === 'desc') {
        return b.email.localeCompare(a.email);
      }
      if (this.sortBy() === 'lastname' && this.sortOrder() === 'asc') {
        return a.lastname.localeCompare(b.lastname);
      }
      if (this.sortBy() === 'lastname' && this.sortOrder() === 'desc') {
        return b.lastname.localeCompare(a.lastname);
      }
      return 0;
    });
  });

  userDetails: Signal<User | undefined> = computed(() => {
    return this.users().find((user: User) => {
      return this.userId() === user.id;
    });
  });

  toggleSortBy(event: Event): void {
    const target = event.target as HTMLButtonElement;
    const option = target.value;
    this.sortBy.set(option);
  }

  toggleSortOrder(event: Event): void {
    const target = event.target as HTMLButtonElement;
    const option = target.value;
    this.sortOrder.set(option);
  }

  showUserDetails(userId: number): void {
    this.userId.set(userId);
  }
}
