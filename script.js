const _container = document.getElementById("container");
const _question = document.getElementById("question");
const _selections = document.querySelector(".selections");
const _questionInfo = document.querySelector(".question-info");
const _nextButton = document.getElementById("next");
const _score = document.getElementById("score");
const _counter = document.getElementById("counter");
const _popup = document.getElementById("popup");
const _lastScore = document.getElementById("lastScore");

let questions;
let score = 0;
let currentQuestionIndex = 0;
let currentQuestion = {};

// Önceki skoru local storage'dan al (eğer varsa)
let previousScore = localStorage.getItem("quizScore");

// Eğer önceki skor varsa göster
if (previousScore !== null) {
  _lastScore.textContent = `Last Score= ${previousScore}`;
}

async function fetchQuestion() {
  const Url = "https://opentdb.com/api.php?amount=4";
  const response = await fetch(Url);
  const data = await response.json();
  questions = data.results;
  console.log(questions);
  initQuestion(questions[0]);
}
//doğru cevabı rastgele bir konuma yerleştir 
function shuffleOptions(options) {
  for (var i = options.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = options[i];
    options[i] = options[j];
    options[j] = temp;
  }
  return options;
}

function initQuestion(question) {
  let options = [];
  let correctAnswer = decodeHTML(question.correct_answer);
  let category = question.category;

  options = question.incorrect_answers.map(decodeHTML);
  options.push(correctAnswer);
  options = shuffleOptions(options);

  _question.innerText = `${decodeHTML(question.question)}`;

  _selections.innerHTML = "";
  //seçenekler için elementleri yarat
  options.forEach((option) => {
    var newOption = document.createElement("button");
    newOption.textContent = option;
    newOption.className = "option";
    newOption.addEventListener("click", function (e) {
      handleSelectedAnswer(correctAnswer, newOption.innerText, e);
    });
    _selections.appendChild(newOption);
  });
  //info yazılar için elementleri yarat
  _counter.innerHTML = `${currentQuestionIndex + 1}/${questions.length}`;
  var info = document.querySelector(".info");
  if (info) {
    info.textContent = `Category: ${decodeHTML(category)}`;
  } else {
    info = document.createElement("span");
    info.className = "info";
    info.textContent = `Category: ${decodeHTML(category)}`;
    _questionInfo.appendChild(info);
  }

  // lastScore elementini oluştur ve ekleyerek göster
  var lastScoreElement = document.getElementById("lastScore");
  if (!lastScoreElement) {
    lastScoreElement = document.createElement("div");
    lastScoreElement.id = "lastScore";
    _container.appendChild(lastScoreElement);
  }

  // localStorage'da quizScore varsa lastScore div'ini görünür yap
  if (localStorage.getItem("quizScore")) {
    lastScoreElement.textContent = `Last Score= ${localStorage.getItem("quizScore")}`;
    lastScoreElement.style.display = "block";
  } else {
    lastScoreElement.style.display = "none";
  }

  _nextButton.style.display = "none";
}

_nextButton.style.display = "none";

function handleSelectedAnswer(correctAnswer, selectedAnswer, element) {
  element.target.parentNode.childNodes.forEach((child) => {
    child.classList.add("prevent-pointer");
  });

  // Skoru güncelle
  if (correctAnswer === selectedAnswer) {
    score = score + 5;
    _score.innerHTML = `Score = ${score}`;
    element.target.classList.add("correct-option");
  } else {
    element.target.classList.add("wrong-option");

    element.target.parentNode.childNodes.forEach((child) => {
      if (decodeHTML(child.innerText) === correctAnswer) {
        child.classList.add("correct-option");
      }
    });
  }

  _nextButton.style.display = "block";
}

function handleNext() {
  // Bir sonraki soruya geç
  currentQuestionIndex++;
  let counter = currentQuestionIndex + 1;
  _counter.innerHTML = `${counter}/${questions.length}`;
  if (currentQuestionIndex < questions.length - 1) {
    initQuestion(questions[currentQuestionIndex]);
  } else {
    _nextButton.innerHTML = "Show Results";
    _nextButton.removeEventListener("click", handleNext);
    _nextButton.addEventListener("click", showResults);
  }
}

_nextButton.addEventListener("click", handleNext);

function showResults() {
  const correctAnswerElement = document.getElementById("correctAnswer");
  const totalScoreElement = document.getElementById("totalScore");
  setLastScore(score);
  correctAnswerElement.textContent = `Correct Answer Count: ${score / 5}`;
  totalScoreElement.textContent = `Total Score: ${score}`;

  _popup.style.display = "block";

  // "Try Again" butonuna tıklanınca quiz'i sıfırla
  const tryAgainButton = document.getElementById("tryAgain");
  tryAgainButton.addEventListener("click", function () {
    resetQuiz();
  });
}

function setLastScore(score) {
  // Skoru local storage'a kaydet
  localStorage.setItem("quizScore", score);
  // Önceki skoru göster
  _lastScore.innerHTML = `Last Score: ${score}`;
  _lastScore.style.display = "block"; // lastScore'u görünür yap
}

function resetQuiz() {
  // Tüm değişkenleri sıfırla
  questions = [];
  score = 0;
  currentQuestionIndex = 0;

  // Sayfa üzerindeki görsel değişiklikleri sıfırla
  _score.innerHTML = "Score = 0";
  _nextButton.innerHTML = "Next";
  _nextButton.removeEventListener("click", showResults);
  _nextButton.addEventListener("click", handleNext);
  _nextButton.style.display = "none";
  _popup.style.display = "none";
  _lastScore.textContent = ""; // Önceki skoru temizle
  _lastScore.style.display = "none"; // lastScore'u gizle

  fetchQuestion();
}

// HTML kodundan özel karakterleri çıkarmak için kullan
function decodeHTML(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

fetchQuestion();
