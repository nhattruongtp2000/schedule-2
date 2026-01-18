import { HttpClientModule } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
const STORAGE_KEY = 'schedule_v1';
import { HttpClient } from '@angular/common/http';
import defaultSchedule from './data/schedule.json';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers: [FormField]
})

export class App {
  protected readonly title = signal('schedule-2');
  schedule: ScheduleDay[] = [];
  constructor(@Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('schedule');

      if (saved) {
        this.schedule = JSON.parse(saved);
      } else {
        // ✅ NO HTTP
        this.schedule = structuredClone(defaultSchedule);
        this.saveToLocalStorage();
      }
    }
  }



  // 🔹 LocalStorage
  saveToLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('schedule', JSON.stringify(this.schedule));
    }
  }

  loadFromLocalStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      this.schedule = JSON.parse(data);
    }
  }

  // 🔹 Generate dates 23/1 → 20/2
  generateDefaultSchedule() {
    const start = new Date(2026, 0, 28);
    const end = new Date(2026, 1, 21);

    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];

    while (start <= end) {
      const dayIndex = start.getDay(); // 0–6

      this.schedule.push({
        date: start.toISOString().slice(0, 10),
        dayName: days[dayIndex],
        isWorkDay: dayIndex >= 1 && dayIndex <= 5,
        morning: '',
        afternoon: '',
        night: '',
        isBusy: false    // ⭐ NEW
      });

      start.setDate(start.getDate() + 1);
    }
  }


  // 🔹 Export JSON
  exportJson() {
    const blob = new Blob(
      [JSON.stringify(this.schedule, null, 2)],
      { type: 'application/json' }
    );

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'schedule.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // 🔹 Import JSON
  importJson(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.schedule = JSON.parse(reader.result as string);
      this.saveToLocalStorage(); // IMPORTANT
    };
    reader.readAsText(file);
  }
}
interface ScheduleDay {
  date: string;
  dayName: string;
  isWorkDay: boolean;
  isBusy: boolean;     // ⭐ NEW
  morning: string;
  afternoon: string;
  night: string;
}
