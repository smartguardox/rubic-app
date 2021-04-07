import { AfterViewInit, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Question } from '../../models/question';



@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  public questions: Question[];

  constructor(private readonly translateService: TranslateService) {
    this.translateService.get('FAQ_QUESTIONS').subscribe(((questions: any[]) => {
      this.questions = questions.map(question => ({
        title: question.QUESTION,
        answer: question.ANSWER,
        isActive: false
      }))
    }));
  }

  public toggleQuestion(containerElement: MouseEvent, question: Question) {
    const answerElement = (containerElement.currentTarget as HTMLElement).children[1] as HTMLElement;
    question.isActive = !question.isActive;
    if (question.isActive) {
      answerElement.style.height = `${answerElement.scrollHeight}px`;
    } else {
      answerElement.style.height = '0';
    }
  }
}
