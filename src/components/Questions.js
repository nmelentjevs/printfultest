import React, { Component } from 'react';

import axios from 'axios';

import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Spinner from 'react-bootstrap/Spinner';

import EndingPage from './EndingPage';

class Questions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questionNumber: 1,
      questions: [],
      answers: [],
      questionsLoading: true,
      page: 'quiz',
      submittedAnswers: []
    };
  }

  componentDidMount() {
    this.setState({ questionsLoading: true });
    axios
      .get(
        `https://cors-anywhere.herokuapp.com/https://printful.com/test-quiz.php?action=questions&quizId=${
          this.props.quizId[0].id
        }`
      )
      .then(res => {
        console.log(res.data);
        this.setState({
          questions: res.data
        });
        res.data.map(question => {
          return axios
            .get(
              `https://cors-anywhere.herokuapp.com/https://printful.com/test-quiz.php?action=answers&quizId=${
                this.props.quizId[0].id
              }&questionId=${question.id}`
            )
            .then(res => {
              console.log(res.data);
              this.setState({
                answers: [...this.state.answers, res.data],
                questionsLoading: false
              });
            });
        });
      })
      .catch(err => console.log(err));
  }
  submitAnswer = id => {
    const { questionNumber, page, questions, submittedAnswers } = this.state;
    questionNumber === questions.length
      ? this.setState({
          page: 'end',
          submittedAnswers: [...submittedAnswers, id]
        })
      : this.setState({
          submittedAnswers: [...submittedAnswers, id],
          questionNumber: questionNumber + 1
        });
  };

  handleClick = direction => {
    const { questionNumber, page, questions, submittedAnswers } = this.state;
    if (direction === 'back') {
      this.setState({ questionNumber: questionNumber - 1 });
    } else {
      questionNumber === questions.length
        ? this.setState({ ...this.state, page: 'end' })
        : this.setState({
            ...this.state,
            submittedAnswers: [...submittedAnswers, 0],
            questionNumber: questionNumber + 1
          });
    }
  };

  render() {
    const {
      questionNumber,
      answers,
      questions,
      questionsLoading,
      page,
      submittedAnswers
    } = this.state;
    const progressInstance = (
      <ProgressBar
        now={(100 / questions.length) * questionNumber}
        label={`${((100 / questions.length) * questionNumber).toFixed(0)}%`}
      />
    );
    let content;
    if (page === 'end') {
      content = (
        <EndingPage
          answers={submittedAnswers}
          quizId={this.props.quizId[0].id}
        />
      );
    } else if (page === 'quiz') {
      content = (
        <div className="question-page">
          <h4 className="display-5">Hi {this.props.name} here is your </h4>
          <h1 className="display-4">
            {this.props.quizId[0].title} Questionaire
          </h1>
          <hr />

          {!questionsLoading ? (
            <div className="question-area">
              {questions[questionNumber - 1].title}
              <div
                className="answers-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gridGap: '10px'
                }}
              >
                {answers[questionNumber - 1].map(answer => {
                  return (
                    <div
                      className="answer"
                      style={{
                        width: '100%',
                        height: '100px',
                        background: 'pink',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        this.submitAnswer(answer.id);
                      }}
                      key={answer.id}
                    >
                      {answer.title}
                    </div>
                  );
                })}
              </div>
              {progressInstance}
              <div
                className="buttons"
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'space-between',
                  marginTop: '10px'
                }}
              >
                <Button
                  variant="primary"
                  onClick={() => this.handleClick('back')}
                >
                  Previous Question
                </Button>
                <Button
                  variant="primary"
                  onClick={() => this.handleClick('forward')}
                >
                  {questionNumber !== questions.length
                    ? 'Skip Question'
                    : 'Finish Test'}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Spinner animation="grow" />
              <Spinner animation="grow" />
              <Spinner animation="grow" />
            </div>
          )}
        </div>
      );
    }
    return content;
  }
}

export default Questions;