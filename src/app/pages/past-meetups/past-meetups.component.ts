import { Component, signal, computed, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Interface representing a meetup entity
 */
interface Meetup {
  readonly id: number;
  readonly title: string;
  readonly presenter: string;
  readonly date: Date;
  readonly description: string;
  readonly totalAttendance: number;
  readonly newRegistrations: number;
  readonly regularAttendees: number;
}

/**
 * Type for date filter options
 */
type DateFilterType = 'all' | 'lastMonth' | 'last3Months' | 'last6Months' | 'thisYear';

/**
 * Type for attendance filter options
 */
type AttendanceFilterType = 'all' | 'low' | 'medium' | 'high';

/**
 * Interface for filter configuration
 */
interface FilterConfig {
  readonly search: string;
  readonly dateRange: DateFilterType;
  readonly attendanceLevel: AttendanceFilterType;
}

/**
 * Interface for pagination configuration
 */
interface PaginationConfig {
  readonly currentPage: number;
  readonly itemsPerPage: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

@Component({
  selector: 'app-past-meetups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './past-meetups.component.html',
  styleUrl: './past-meetups.component.css',
})
export class PastMeetupsComponent implements OnInit {
  protected readonly Math = Math;
  
  // Search and filter signals
  readonly searchTerm = signal<string>('');
  readonly dateFilter = signal<DateFilterType>('all');
  readonly attendanceFilter = signal<AttendanceFilterType>('all');
  
  // Pagination signals
  readonly currentPage = signal<number>(1);
  readonly itemsPerPage = signal<number>(5);

  // Mock data - replace with actual service call
  private readonly meetups = signal<Meetup[]>([
    {
      id: 1,
      title: 'Java Meetup #10',
      presenter: 'John Doe',
      date: new Date('2024-08-15'),
      description: 'Explore the latest Java features and best practices for modern application development. We\'ll cover performance optimization, new syntax improvements, and real-world use cases.',
      totalAttendance: 45,
      newRegistrations: 12,
      regularAttendees: 33
    },
    {
      id: 2,
      title: 'Spring Boot Deep Dive',
      presenter: 'Jane Smith',
      date: new Date('2024-07-20'),
      description: 'A comprehensive look at Spring Boot architecture, auto-configuration, and advanced features. Learn how to build scalable microservices with Spring Boot 3.x.',
      totalAttendance: 38,
      newRegistrations: 8,
      regularAttendees: 30
    },
    {
      id: 3,
      title: 'Microservices Architecture',
      presenter: 'Bob Wilson',
      date: new Date('2024-06-18'),
      description: 'Design patterns and best practices for building distributed systems. Covering service discovery, circuit breakers, and communication strategies.',
      totalAttendance: 52,
      newRegistrations: 15,
      regularAttendees: 37
    },
    {
      id: 4,
      title: 'Java 21 Features',
      presenter: 'Alice Johnson',
      date: new Date('2024-05-16'),
      description: 'Discover the exciting new features in Java 21 LTS including virtual threads, pattern matching, and record patterns. Hands-on examples included.',
      totalAttendance: 41,
      newRegistrations: 10,
      regularAttendees: 31
    },
    {
      id: 5,
      title: 'Testing Strategies',
      presenter: 'Charlie Brown',
      date: new Date('2024-04-14'),
      description: 'Effective testing strategies for Java applications. Learn about unit testing, integration testing, and test-driven development practices.',
      totalAttendance: 29,
      newRegistrations: 6,
      regularAttendees: 23
    },
    {
      id: 6,
      title: 'Cloud Native Java',
      presenter: 'Diana Prince',
      date: new Date('2024-03-12'),
      description: 'Building cloud-native Java applications with containers, Kubernetes, and serverless technologies. Performance and scalability considerations.',
      totalAttendance: 47,
      newRegistrations: 13,
      regularAttendees: 34
    }
  ]);

  // Computed properties for filtering and pagination
  readonly filteredMeetups = computed(() => {
    let filtered = this.meetups();

    // Search filter
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(meetup => 
        meetup.title.toLowerCase().includes(search) ||
        meetup.presenter.toLowerCase().includes(search)
      );
    }

    // Date filter
    const dateFilter = this.dateFilter();
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'lastMonth':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'last3Months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'last6Months':
          filterDate.setMonth(now.getMonth() - 6);
          break;
        case 'thisYear':
          filterDate.setFullYear(now.getFullYear(), 0, 1);
          break;
      }
      
      filtered = filtered.filter(meetup => meetup.date >= filterDate);
    }

    // Attendance filter
    const attendanceFilter = this.attendanceFilter();
    if (attendanceFilter !== 'all') {
      filtered = filtered.filter(meetup => {
        switch (attendanceFilter) {
          case 'low': return meetup.totalAttendance < 20;
          case 'medium': return meetup.totalAttendance >= 20 && meetup.totalAttendance <= 50;
          case 'high': return meetup.totalAttendance > 50;
          default: return true;
        }
      });
    }

    return filtered;
  });

  readonly totalPages = computed(() => 
    Math.ceil(this.filteredMeetups().length / this.itemsPerPage())
  );

  readonly startIndex = computed(() => 
    (this.currentPage() - 1) * this.itemsPerPage()
  );

  readonly paginatedMeetups = computed(() => {
    const start = this.startIndex();
    return this.filteredMeetups().slice(start, start + this.itemsPerPage());
  });

  ngOnInit(): void {
    // Component initialization logic can be added here
    // For example: loading initial data, setting up subscriptions, etc.
  }

  /**
   * Generate pie chart gradient for individual meetup attendance data
   * @param meetup - The meetup object containing attendance data
   * @returns CSS conic-gradient string for the pie chart
   */
  getPieChartGradient(meetup: Meetup): string {
    if (meetup.totalAttendance === 0) {
      return 'conic-gradient(#e5e7eb 0deg 360deg)';
    }
    
    const newPercentage = (meetup.newRegistrations / meetup.totalAttendance) * 100;
    const newAngle = Math.round((newPercentage / 100) * 360);
    
    return `conic-gradient(#10b981 0deg ${newAngle}deg, #3b82f6 ${newAngle}deg 360deg)`;
  }

  // Pagination methods
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    // Show up to 5 page numbers around current page
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}


