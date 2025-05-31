import { Pipe, PipeTransform } from '@angular/core';

export interface Option {
  value: string;
  label: string;
}

@Pipe({
  name: 'findLabel',
  standalone: true
})
export class FindLabelPipe implements PipeTransform {
  transform(options: Option[], value: string): string {
    if (!options || !value) {
      return value || '';
    }

    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  }
}
