// External Dependencies
import React, { Component } from 'react'
import clone from 'clone'
import styled from 'styled-components/native'
import { View, Text, TouchableOpacity, Button } from 'react-native'

// Our Components
import Home from '../Home'
import QuizComplete from '../QuizComplete'
import Header from 'components/Header'
import { clearLocalNotification, setLocalNotification } from 'util/notifications'

export default class Quiz extends Component {
  state = {
    correctAnswers: 0,
    incorrectAnswers: 0,
    showAnswer: false,
    currentQuestionIndex: 0,
  }

  componentWillUpdate({ deck }, { correctAnswers, incorrectAnswers, currentQuestionIndex }) {
    const deckLength = deck.questions.length
    const isLastQuestion =  deckLength === (currentQuestionIndex + 1)
    const isScoreUpdated = (correctAnswers + incorrectAnswers) === deckLength

    // Only navigate to the completeQuiz screen 
    // if the last question is being displayed
    // and the score is updated
    if (isLastQuestion && isScoreUpdated) {
      const score = (correctAnswers / deckLength) * 100

      // Update Status
      this.props.saveStatus({
        lastQuizTaken: deck.title ,
        lastScore: score,
      })

      // Cancel any pending quiz reminders
      // And set a new one for tomorrow
      clearLocalNotification()
        .then(setLocalNotification)

      // Navigate to QuizComplete Screen
      this.navigateToQuizComplete(score)
    }
  }

  navigateToQuizComplete = (score) => {
    const { navigator, deck, saveStatus } = this.props

    navigator.push({
      component: QuizComplete,
      title: "Quiz Completed",
      leftButtonTitle: ' ',
      rightButtonIcon: require('./images/deck.png'),
      onRightButtonPress: () => navigator.popToTop(),
      passProps: { 
        deck,
        score,
        saveStatus,
      }
    })
  }

  navigateToNextQuestion = () => {
    this.setState(({ currentQuestionIndex }) => ({
      currentQuestionIndex: currentQuestionIndex + 1, 
    }))
  }

  incrementCorrectAnswers = () => {
    this.setState(({ correctAnswers }) => ({
      correctAnswers: correctAnswers + 1,
    }))
  }

  incrementInCorrectAnswers = () => (
    this.setState(({ incorrectAnswers }) => ({
      incorrectAnswers: incorrectAnswers + 1,
    }))
  )

  render() {
    const { deck } = this.props
    const { 
      showAnswer, 
      currentQuestionIndex,
      correctAnswers, 
      incorrectAnswers,
    } = this.state
    
    // Grab variables to display
    const questionsLength = deck.questions.length
    const currentQuestionNumber = currentQuestionIndex + 1
    const { question, answer } = deck.questions[currentQuestionIndex]

    // Determine if we are at
    // the last question
    const isLastQuestion = questionsLength === currentQuestionNumber
    
    return (
      <MainContainer>
        <Header/>
        <QuestionCountText>{currentQuestionNumber} / {questionsLength}</QuestionCountText>
        <QuestionContainer>
          <HeaderText>
            { showAnswer ? answer: question}
          </HeaderText>
          <ViewAnswerButton
            onPress={() => this.setState({ showAnswer: !showAnswer })}
            title={ showAnswer ? "View Question" : "Show Answer" }
            color="#3B48EE"
            accessibilityLabel="View the answer to the question"
          />
        <ButtonContainer>
          <AnswerButton onPress={() => {
            this.incrementInCorrectAnswers()
            if(!isLastQuestion) {
              this.navigateToNextQuestion()
            } 
          }}>
            <ButtonText>Incorrect</ButtonText>
          </AnswerButton>
          <AnswerButton primary
            onPress={() => {
              this.incrementCorrectAnswers()
              if(!isLastQuestion) {
                this.navigateToNextQuestion()
              } 
          }}>
            <ButtonText>Correct</ButtonText>
          </AnswerButton>
        </ButtonContainer>
        </QuestionContainer>
      </MainContainer>
    )
  }
}

// Styled Components
const MainContainer = styled.View`
  flex: 1
`
const QuestionContainer = styled.View`
  flex: 1
  margin-top: 100
  align-items: center
`
const QuestionCountText = styled.Text`
  color: #485465
  font-size: 17
  margin-left: 25
  font-family: Helvetica Neue  
`
const HeaderText = styled.Text`
  width: 400
  font-size: 35
  color: #485465
  font-weight: 300
  margin-bottom: 10
  text-align: center
`
const ViewAnswerButton = styled.Button`
  font-size: 17
`
const ButtonContainer = styled.View`
  margin-top: 60
  flex-direction: row
`
const AnswerButton = styled.TouchableOpacity`
  height: 50
  width: 150
  margin-left: 10
  border-radius: 4
  shadow-radius: 3;
  shadow-opacity: 0.1
  align-self: center
  justify-content: center
  align-items: center
  background-color: ${props => props.primary ? '#3B48EE' : '#FC6180'}
  shadow-color: ${props => props.primary ? '#3B48EE' : '#FC6180'}
` 
const ButtonText = styled.Text`
  font-size: 16
  color: #FFF
`