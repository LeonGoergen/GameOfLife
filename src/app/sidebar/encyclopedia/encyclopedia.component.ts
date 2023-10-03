import {Component, OnInit} from '@angular/core';
import { localCategories } from '../../../assets/patterns';
import { MatDialogRef } from '@angular/material/dialog';
import {MatTabChangeEvent} from "@angular/material/tabs";

@Component({
  selector: 'app-encyclopedia',
  templateUrl: './encyclopedia.component.html',
  styleUrls: ['./encyclopedia.component.css']
})
export class EncyclopediaComponent implements OnInit {
  categories = localCategories;
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
        const existingPattern = category.patterns.find((p) => p.title === pattern.title);
        if (!existingPattern) {
          category.patterns.push({
            title: pattern.title,
            description: pattern.description,
            rle: pattern.rle,
          });
        }
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

  isTitleInvalid: boolean = false;
  isRleInvalid: boolean = false;

  addPattern(rleString: string, title: string, description: string): void {
    rleString = rleString.replace(/\s+/g, '');

    const category = this.categories.find((cat) => cat.title === this.currentCategory);
    const isDuplicateTitle = category && category.patterns.some((pattern) => pattern.title === title);

    if (isDuplicateTitle !== undefined)

    this.isTitleInvalid = isDuplicateTitle;
    this.isRleInvalid = !this.isValidRle(rleString);

    if (!this.isTitleInvalid && !this.isRleInvalid) {
      const pattern = {
        category: this.currentCategory,
        title: title,
        description: description,
        rle: rleString
      }
      this.savePattern(pattern);

      this.isValidInput = true;

      if (category) {
        category.patterns.push(pattern);
      }
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

      // Instead of reloading the page, remove the pattern from the category's patterns
      const category = this.categories.find((cat) => cat.title === this.currentCategory);
      if (category) {
        const patternIndex = category.patterns.findIndex((pattern) => pattern.title === titleToDelete);
        if (patternIndex !== -1) {
          category.patterns.splice(patternIndex, 1);
        }
      }
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
