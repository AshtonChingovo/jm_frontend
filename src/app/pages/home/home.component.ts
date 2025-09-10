import { Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';

/**
 * Interface representing attendance data structure
 */
interface AttendanceData {
  readonly newRegistrations: number;
  readonly returningMembers: number;
  readonly total: number;
}

/**
 * Interface representing meetup information
 */
interface MeetupInfo {
  readonly title: string;
  readonly host: string;
  readonly number: number;
}

/**
 * Interface for QR code generation options
 */
interface QrCodeOptions {
  readonly width: number;
  readonly margin: number;
  readonly color: {
    readonly dark: string;
    readonly light: string;
  };
  readonly errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly destroyRef = inject(DestroyRef);

  // Reactive state management with signals
  readonly qrDataUrl = signal<string | null>(null);
  readonly isLoadingQr = signal<boolean>(true);

  // Meetup configuration
  readonly meetupInfo = signal<MeetupInfo>({
    title: 'Java Meetup #23',
    host: 'John Doe',
    number: 23,
  });

  // Private attendance signals
  private readonly newRegistrations = signal<number>(32);
  private readonly returningMembers = signal<number>(96);

  // Computed attendance data
  readonly attendanceData = computed<AttendanceData>(() => ({
    newRegistrations: this.newRegistrations(),
    returningMembers: this.returningMembers(),
    total: this.newRegistrations() + this.returningMembers(),
  }));

  // Computed pie chart gradient with error handling
  readonly pieChartGradient = computed(() => {
    const data = this.attendanceData();
    
    if (data.total === 0) {
      return 'conic-gradient(#e5e7eb 0deg 360deg)';
    }
    
    const newPercentage = (data.newRegistrations / data.total) * 100;
    const newAngle = Math.round((newPercentage / 100) * 360);
    
    return `conic-gradient(#10b981 0deg ${newAngle}deg, #3b82f6 ${newAngle}deg 360deg)`;
  });

  constructor() {
    this.initializeComponent();
  }

  /**
   * Initialize component lifecycle and start QR code generation
   */
  private initializeComponent(): void {
    this.generateQrCode()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  /**
   * Generate QR code observable for reactive handling
   */
  private generateQrCode() {
    return from(this.createQrCode());
  }

  /**
   * Create QR code with proper error handling and loading states
   */
  private async createQrCode(): Promise<void> {
    try {
      this.isLoadingQr.set(true);
      
      // Dynamic import to avoid SSR issues and optimize bundle size
      const { toDataURL } = await import('qrcode');
      
      const meetup = this.meetupInfo();
      const qrOptions: QrCodeOptions = {
        width: 640,
        margin: 2,
        color: {
          dark: '#1f2937', // gray-800
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      };
      
      const payload = JSON.stringify({
        meetupTitle: meetup.title,
        meetupNumber: meetup.number,
        host: meetup.host,
        type: 'checkin',
        timestamp: new Date().toISOString(),
        checkInUrl: `${window.location.origin}/checkin/${meetup.number}`
      });
      
      const qrCodeUrl = await toDataURL(payload, qrOptions);
      this.qrDataUrl.set(qrCodeUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      this.qrDataUrl.set(null);
    } finally {
      this.isLoadingQr.set(false);
    }
  }

  /**
   * Update attendance data with validation
   * @param newRegistrations - Number of new registrations
   * @param returningMembers - Number of returning members
   */
  updateAttendanceData(newRegistrations: number, returningMembers: number): void {
    this.newRegistrations.set(Math.max(0, newRegistrations));
    this.returningMembers.set(Math.max(0, returningMembers));
  }

  /**
   * Update meetup information
   * @param meetupInfo - Partial meetup information to update
   */
  updateMeetupInfo(meetupInfo: Partial<MeetupInfo>): void {
    this.meetupInfo.update(current => ({ ...current, ...meetupInfo }));
  }
}


