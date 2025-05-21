import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'findLabel',
  standalone: true
})
export class FindLabelPipe implements PipeTransform {
  transform(options: { value: string, label: string }[], value: string): string {
    if (!options || !value) return '';

    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  }
}
