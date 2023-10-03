import {Component, OnInit} from '@angular/core';
import { categories } from '../../../assets/patterns';
import { MatDialogRef } from '@angular/material/dialog';
import {MatTabChangeEvent} from "@angular/material/tabs";

interface ngOnInit {
}

@Component({
  selector: 'app-encyclopedia',
  templateUrl: './encyclopedia.component.html',
  styleUrls: ['./encyclopedia.component.css']
})
export class EncyclopediaComponent implements OnInit {
  categories = categories;
  currentCategory: string = 'Static Patterns';
  isValidInput: boolean = true;
  buttonPressed: boolean = false;

  constructor(private dialogRef: MatDialogRef<EncyclopediaComponent>) { }

  onTabChange(event: MatTabChangeEvent): void {
    this.currentCategory = event.tab.textLabel;
  }

  ngOnInit(): void {
    this.loadPatternsFromLocalStorage();
  }

  loadPatternsFromLocalStorage(): void {
    const storedPatterns = this.getStoredPatterns();

    for (const pattern of storedPatterns) {
      const category = this.categories.find((cat) => cat.title === pattern.category);
      if (category) {
        category.patterns.push({
          title: pattern.title,
          description: pattern.description,
          rle: pattern.rle,
        });
      }
    }
  }

  copyToClipboard(rle: string): void {
    navigator.clipboard.writeText(rle).then((): void => {
      this.dialogRef.close();
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }

  insertRle(rleString: string): void {
    rleString = rleString.replace(/\s+/g, '');

    if (this.isValidRle(rleString)) {
      const pattern = {
        category: this.currentCategory,
        title: (document.querySelector('#CaptionInput') as HTMLTextAreaElement).value,
        description: (document.querySelector('#DescriptionInput') as HTMLTextAreaElement).value,
        rle: rleString
      }
      this.savePattern(pattern);

      this.isValidInput = true;
      window.location.reload();
    } else {
      this.isValidInput = false;
      this.buttonPressed = true;
    }
  }

  savePattern(pattern: any): void {
    const storedPatterns = this.getStoredPatterns();
    storedPatterns.push(pattern);
    localStorage.setItem('patterns', JSON.stringify(storedPatterns));
  }

  getStoredPatterns(): any[] {
    const storedPatternsJSON = localStorage.getItem('patterns');
    return storedPatternsJSON ? JSON.parse(storedPatternsJSON) : [];
  }

  deletePattern(titleToDelete: string): void {
    const storedPatterns = this.getStoredPatterns();
    const indexToDelete = storedPatterns.findIndex((pattern: any) => pattern.title === titleToDelete);

    if (indexToDelete !== -1) {
      storedPatterns.splice(indexToDelete, 1);
      localStorage.setItem('patterns', JSON.stringify(storedPatterns));
      this.loadPatternsFromLocalStorage();
      window.location.reload();
    }
  }

  isValidRle(rleString: string): boolean {
    const pattern = /^[ob$0-9]+!$/;
    return pattern.test(rleString);
  }

  onInput(): void {
    this.isValidInput = true;
    this.buttonPressed = false;
  }
}
