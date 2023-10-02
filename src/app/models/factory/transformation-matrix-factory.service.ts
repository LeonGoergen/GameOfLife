import { Injectable } from '@angular/core';
import {TransformationMatrix} from "../transformation-matrix.model";

@Injectable({
  providedIn: 'root'
})
export class TransformationMatrixFactoryService {
  create(): TransformationMatrix {
    return {
      scaleX: 1,
      skewY: 0,
      skewX: 0,
      scaleY: 1,
      translateX: 0,
      translateY: 0
    };
  }
}
