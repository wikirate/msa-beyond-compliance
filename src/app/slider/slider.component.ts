import { Component, AfterContentInit, ContentChildren, ViewChild, QueryList, ElementRef } from '@angular/core';
import { SliderItemDirective } from './slider-item.directive';


@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements AfterContentInit {

  //@ts-ignore
  @ContentChildren(SliderItemDirective, { read: ElementRef }) items
    : QueryList<ElementRef<HTMLDivElement>>;
  //@ts-ignore
  @ViewChild('slides') slidesContainer: ElementRef<HTMLDivElement>;

  private slidesIndex = 0;

  get currentItem(): ElementRef<HTMLDivElement>{
    //@ts-ignore
    return this.items.find((item, index) => index === this.slidesIndex);
  }

  ngAfterContentInit() {
  }

  ngAfterViewInit() {
  }

  onClickLeft() {
    //@ts-ignore
    this.slidesContainer.nativeElement.scrollLeft -= this.currentItem.nativeElement.offsetWidth;
    
    if (this.slidesIndex > 0) {
      this.slidesIndex--;
    } 
  }

  onClickRight() {
    this.slidesContainer.nativeElement.scrollLeft += this.currentItem.nativeElement.offsetWidth;

    if (this.slidesIndex < this.items.length - 1) {
      this.slidesIndex++
    }
  }

}