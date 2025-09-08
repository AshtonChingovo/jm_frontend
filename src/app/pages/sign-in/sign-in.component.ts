import { Component } from '@angular/core';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  template: `
    <div class="max-w-sm">
      <h2 class="text-2xl font-semibold tracking-tight mb-4">Sign In</h2>
      <form class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
        </div>
        <button type="button" class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Sign In</button>
      </form>
    </div>
  `,
})
export class SignInComponent {}


