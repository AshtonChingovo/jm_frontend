import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div class="md:col-span-2 space-y-6">
        <div>
          <h2 class="text-4xl font-semibold tracking-tight">Java Meetup #23</h2>
          <p class="text-gray-600">Host: John Doe</p>
        </div>

        <div class="flex items-start gap-8">
          <div class="flex flex-col items-center">
            @if (qrDataUrl()) {
              <img
                [src]="qrDataUrl()!"
                alt="QR code for Java Meetup #23"
                class="h-[24rem] w-[24rem] rounded-md border border-gray-200 bg-white p-4 shadow"
              />
            }
            <div class="mt-4 text-center text-sm text-gray-600">
              <p>Scan the QR code to check in.</p>
              <p class="mt-2">Point your phone camera at the code to get the check-in link.</p>
            </div>
          </div>
        </div>
      </div>

      <aside class="md:col-span-1">
        <div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 class="text-base font-semibold text-gray-900">Attendance</h3>
          <div class="mt-4 grid grid-cols-3 gap-4">
            <div class="col-span-3">
              <div class="text-4xl font-bold text-gray-900">{{ total() }}</div>
              <div class="text-xs text-gray-500">Total attendees</div>
            </div>
            <div class="col-span-1">
              <div class="text-xl font-semibold text-gray-900">{{ newRegistrations() }}</div>
              <div class="text-xs text-gray-500">New</div>
            </div>
            <div class="col-span-1">
              <div class="text-xl font-semibold text-gray-900">{{ returningMembers() }}</div>
              <div class="text-xs text-gray-500">Returning</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  `,
})
export class HomeComponent {
  readonly qrDataUrl = signal<string | null>(null);
  readonly newRegistrations = signal<number>(32);
  readonly returningMembers = signal<number>(96);
  readonly total = signal<number>(this.newRegistrations() + this.returningMembers());

  constructor() {
    // Lazy-import to avoid SSR/node issues and keep bundle small.
    this.generateQr();
  }

  private async generateQr(): Promise<void> {
    try {
      const { toDataURL } = await import('qrcode');
      const payload = JSON.stringify({
        meetup: 'Java Meetup #23',
        host: 'John Doe',
        type: 'checkin',
      });
      const url = await toDataURL(payload, { width: 640, margin: 1 });
      this.qrDataUrl.set(url);
    } catch (err) {
      console.error('Failed generating QR:', err);
      this.qrDataUrl.set(null);
    }
  }
}


