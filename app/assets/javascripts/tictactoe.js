// Code your JavaScript / jQuery solution here

const WIN_COMBOS = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
];

var turn = 0;
var currentGame = 0;

$(document).ready(function(){
    attachListeners();
  });

function player(game) {
    return turn % 2 === 0 ? "X" : "O"
}

function updateState(position) {
  var currentPlayer = player();
  $(position).text(currentPlayer);
}

function setMessage(message){
    $('#message').text(message);
  }

  function checkWinner(){
    var board = {};
    var winner = false;
  
    $('td').text((index, square) => board[index] = square);
  
    WIN_COMBOS.some(function(position){
      if (board[position[0]] !== "" && board[position[0]]  === board[position[1]] && board[position[1]] === board[position[2]]){
        setMessage(`Player ${board[position[0]]} Won!`);
        return winner = true;
      }
    });
    return winner;
  }

  function positionTaken(position){
    return position.innerText != ""
  }
  
  function validMove(square){
    return !positionTaken(square)
  }
  
  function full() {
    return $.makeArray($("td")).every(function(cell){
      return !(cell.innerHTML === "")
    })
  }

  function clearBoard(){
    $('td').empty();
    turn = 0;
  }

  function clearGame(){
    if (currentGame){
      clearBoard();
      currentGame = 0;
    } else {
      clearBoard();
    }
  }
  
  function doTurn(square){
    updateState(square);
    turn++;
    if (checkWinner()){
      saveGame();
      clearGame();
    }else if(turn === 9){
      setMessage("Tie game.");
      saveGame();
      clearGame();
    }
  }
  
  function saveGame(){
    var state = [];
    var gameData = {};
    var url = '/games'
  
    //get board and put into an Array
    $('td').text(function(index, square) {
      state.push(square);
    });
    if (currentGame) {
      gameData = { 'game': {'state': state, 'id': currentGame} }
      $.ajax({
        url: `${url}/${gameData.game.id}`,
        data: gameData,
        type: 'PATCH',
      })
    } else {
      gameData = { 'game': {'state': state} }
      $.post(url, gameData, function(game) {
        currentGame = parseInt(game.data.id)
        $('#games').append(`<button-id="gameid-${currentGame}">You successfully saved Game ${currentGame}</button><br>`);
        $(`#gameid-${currentGame}`).on('click', ()=> loadGame(currentGame));
      });
    }
  }
  
  function previousGames(){
    // need the button to send GET request to the /games route
    var url = '/games'
    $.get(url, function(games) {
    $('#games').empty();
  
      games.data.forEach(function(game){
        $('#games').append(`<button id="gameid-${game.id}">${game.id}</button>`);
        $(`#gameid-${game.id}`).on('click', () => loadGame(game.id));
      });
    });
  }
  
  // load previous game to view that have been saved in dB //
  function loadGame(game){
    var id  = event.path[0].innerText
    var url = `/games/${id}`
  
    $.get(url, function(game) {
      currentGame = game.data.id;
      var gameState = game.data.attributes.state;
      turn = gameState.join("").length;
  
      var counter = 0;
      var td = $("td");
      $.each(td, function(key,value){
        value.innerHTML = gameState[counter];
        counter++
      });
    });
  }
  
  // Attach listeners for buttons on click and call functions //
  function attachListeners(){
    $('td').on('click', function(){
      if (!$.text(this) && !checkWinner()){
        doTurn(this);
      }
    });
    $('#save').on('click', function() {
        saveGame()
    });
    $('#previous').on('click', function() {
        previousGames()
    });
    $('#clear').on('click', function() {
        clearGame()
    });
  }