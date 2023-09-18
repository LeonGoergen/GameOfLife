import {Component} from '@angular/core';
import { categories } from '../../../../assets/patterns';

@Component({
  selector: 'app-encyclopedia',
  templateUrl: './encyclopedia.component.html',
  styleUrls: ['./encyclopedia.component.css']
})
export class EncyclopediaComponent {
  categories = categories;
}
