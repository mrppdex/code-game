import { Component, AfterViewInit, OnInit } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';

import { Observable, Subject, of, from, race } from 'rxjs';
import { throttleTime, repeat, delay, endWith, catchError, toArray, tap } from 'rxjs/operators';

import * as jStat from 'jstat';

const DATA = [
  { name: 'orange', code: 1 },
  { name: 'apple', code: 2 },
  { name: 'banana', code: 3 },
  { name: 'cucumber', code: 4 },
  { name: 'pear', code: 5 },
  { name: 'pineapple', code: 6 },
  { name: 'loose nectarine', code: 7 },
  { name: 'leek', code: 8 }
]


@Component({
  selector: 'app-minigame',
  templateUrl: './minigame.component.html',
  styleUrls: ['./minigame.component.css']
})
export class MinigameComponent implements OnInit, AfterViewInit {

  myTime$;
  noMoreQuestions$ = new Subject<boolean>();
  questionsStream$;
  nextQuestion$ = new Subject<any>();
  currentQuestion;

  startTime;
  endTime;
  timeAllowed = 30*1000; // seconds
  timer: number = this.timeAllowed;
  timeRunning: boolean = false;
  result: number = 0;
  clicks: number = 0;
  rightAnswer: number;
  questionsLoaded: boolean = false;
  questions;
  questionsList: any = [];
  questionCounter = 0;
  listOfCodes = [];
  numberOfQuestions: number = 0;
  isVertical: boolean = false;

  constructor( breakpointObserver: BreakpointObserver) { 
    const layoutChanges = breakpointObserver.observe([
      '(orientation: portrait)',
      '(orientation: landscape)',
    ]);

    layoutChanges.subscribe(result => {
      if (result.breakpoints['(orientation: portrait)']) {
        this.isVertical = true;
      } else {
        this.isVertical = false;
      }
      console.log(result);
    });
  }

  triggerEnd() {
    this.noMoreQuestions$.next(true);
  }

  updateCurrentQuestion() {
    if ( this.numberOfQuestions <= 0 ) {
      console.log('question no more');
      this.noMoreQuestions$.next(true);
      this.currentQuestion = undefined;
    } else if (this.questionsList.length > 0) {
      this.numberOfQuestions -= 1;
      // console.log('question: '+this.numberOfQuestions+' ', this.questionsList[this.numberOfQuestions]);
      this.currentQuestion =  this.questionsList[this.numberOfQuestions];
    }
  }

  getQuestions() {
    console.log('getQuestions(): ',this.questionsLoaded);
    if(this.questionsLoaded) {
        this.questions = this.questions.sort(() => Math.random() - 0.5);
        for (let q of this.questions) {
          let answer = q.code;
          let tmpList = this.listOfCodes.filter(x => x !== answer);
          tmpList = tmpList.sort(() => Math.random() - 0.5).slice(0,2);
          tmpList.push(answer);
          tmpList = tmpList.sort(() => Math.random() - 0.5);
          // console.log({...q, choices: tmpList});
          this.questionsList.push({...q, choices: tmpList});
        }
        this.numberOfQuestions = this.questionsList.length;
    }

  }

  restart() {
    this.result = 0;
    this.clicks = 0;
    this.timeRunning = true;
    // this.noMoreQuestions$.next(false);
    this.myTime$.unsubscribe();
    this.questionsList = [];
    this.getQuestions();
    this.updateCurrentQuestion();
    this.ngAfterViewInit();
  }

  initQuestions() {
    this.questionsStream$ = from(DATA);
    this.questionsStream$
      .pipe(
        tap( x => this.listOfCodes.push( x.code )),
        toArray(),
        catchError((err, caught) => caught)
      )
      .subscribe(
        res => {
          console.log('initQuestions()');
          this.questions = res;
          this.questionsLoaded = true;
        }
      )
  }

  get finalResult() {
    if (this.result < 0) return(-1);
    let prob = jStat.binomial.cdf(this.result, this.clicks, 1/3);
    // return Math.floor(1000*prob)/10 + "%";
    let dt = 200*(1.001-(this.endTime - this.startTime)/this.timeAllowed) | 0;
    return Math.floor(dt + this.result*prob*100);
  }

  get restartButtonLabel() {
    return (this.clicks > 0)?'again!':'start';
  }


  clicked(value) {
    // this.rightAnswer = this.currentQuestion.code;
    this.clicks += 1;
    if (value == this.currentQuestion.code) {
      this.result += 1;
    }
    console.log('your answer: '+value+', correct answer: '+this.currentQuestion.code+' result: '+this.result);

    this.updateCurrentQuestion();
  }
    

  ngAfterViewInit() {
    this.startTime = Date.now();
    this.myTime$ = new Observable(
      observator => {
        let myInterval = setInterval(
          () => {  
            let dt = this.timeAllowed - (Date.now() - this.startTime);
            if (dt > 0) {
              observator.next(dt);
            } else {
              setTimeout(() => this.timeRunning = false);
              observator.complete();
              if (!this.timeRunning) {
                clearInterval(myInterval);
              }
            }
          }, 
          0
        )

      }    
    ).pipe(throttleTime(50), endWith(0))
      .subscribe((res) => { 
          this.timer = Number(res);
          if (this.timer === 0) {
            this.myTime$.unsubscribe();
          }
        }
    );    
    this.noMoreQuestions$
      .subscribe((res) => { 
        this.endTime = Date.now();
        this.timeRunning = false;
      }
    );
    //this.restart();

  }

  ngOnInit() {
    this.initQuestions();
    this.getQuestions();
    this.updateCurrentQuestion();
    //this.restart();
  }

}