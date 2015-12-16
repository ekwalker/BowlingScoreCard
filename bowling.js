'use strict';

var numPlayers = 1;
var currentFrame = 1;
var totalScore = 0;

function setup() {
    var playerNames = document.getElementsByClassName('name');
    var player;

    for (var i = 0; i < playerNames.length; i++) {
        playerNames[i].setAttribute('contenteditable', true);
    }

    var addPlayer = document.getElementById('add_button');
    addPlayer.onclick = function() {
        if(numPlayers < 5) {
            document.getElementById('game_' + numPlayers).style.display = "table";
            numPlayers++;
        } else {
            alert('Error: only 5 players are supported, sorry!');
        }
    }

    var removePlayer = document.getElementById('remove_button');
    removePlayer.onclick = function() {
        if(numPlayers > 1) {
            document.getElementById('game_' + (numPlayers - 1)).style.display = "none";
            numPlayers--;
        } else {
            alert('Error: You must have at least one player!');
        }
    }

    var startButton = document.getElementById('start_game');
    startButton.onclick = function() {
        var confirm = window.confirm('Are you sure you want to start the game? You won\'t be able to add any more players or edit player names anymore.');
        if(confirm === true) {
            for (i = 0; i < playerNames.length; i++) {
                playerNames[i].setAttribute('contenteditable', false);
            }
            addPlayer.onclick = null;
            removePlayer.onclick = null;
            startButton.onclick = null;
            document.getElementById('controls').style.display="none";
            makeEditable(document.getElementById('frame_0_1_1'));
        }
    }

}

function makeEditable(element) {
    element.setAttribute('contenteditable', true);
    element.style.backgroundColor = '#CBF5F5';
    element.focus();
    var id = element.id;
    var playerid = parseInt(id.replace(/[^0-9]+([0-9])\_[0-9]+\_[0-9]/, '$1'));
    var frame = parseInt(id.replace(/[^0-9]+[0-9]\_([0-9]+)\_[0-9]/, '$1'));
    var inputFrame = parseInt(id.replace(/[^0-9]+[0-9]\_[0-9]+\_([0-9])/, '$1'));
    var submitScore = function() {
        if(element.textContent === 'x') {
            element.textContent = 'X';
        }
        var score = element.textContent;
        if(validateScore(score, inputFrame, frame, playerid)) {
            totalScore = 0;
            calculateScores(playerid, 1, 0);
            element.style.backgroundColor  = '';
            if(frame === currentFrame && ((inputFrame > 1 && frame < 10) || (score === 'X' && frame < 10) || (frame === 10 && inputFrame === 3))){
                nextMove(playerid, frame);
            } else if(frame === currentFrame) {
                var next = document.getElementById('frame_' + playerid + '_' + frame + '_' + (inputFrame + 1));
                makeEditable(next);
            }
        } else {
            alert('Error: invalid score: ' + score + '.  Please enter 0-9, /, or X in the appropriate square.');
            element.textContent = '';
            element.focus();
        }
    };
    element.onpaste = function() { return false; }
    element.onkeydown = function(e) {
        if(e.keyCode === 13) {
            e.preventDefault();
            submitScore();
        } else if(e.which != 8 && element.textContent.length > 0) {
            e.preventDefault();
        }
    }
}

function calculateScores(player, frame, checkingNext) {
    var frameScore;
    var score1 = document.getElementById('frame_' + player + '_' + frame + '_' + 1).textContent;
    var score2 = document.getElementById('frame_' + player + '_' + frame + '_' + 2).textContent;
    var score3;
    if(frame === 10) {
        score3 = document.getElementById('frame_' + player + '_' + frame + '_' + 3).textContent;
        if(score3 !== 'X') {
            score3 = parseInt(score3);
        }
    }
    if(score1 !== 'X') {
        score1 = parseInt(score1);
    }
    if(score2 !== '/') {
        if(frame !== 10 || score2 !== 'X') {
            score2 = parseInt(score2);
        }
    }
    if(score1 !== 'X' && isNaN(score1)) {
        frameScore = NaN;
        document.getElementById('score_' + player).textContent = totalScore;
        return NaN;
    }
    if(score1 === 'X') {
        if(checkingNext === 1) {
            return 10;
        } else if(checkingNext === 2) {
            if(currentFrame > frame) {
                return 10 + calculateScores(player, frame + 1, 1);
            } else {
                if(score2 === '/') {
                    return 20;
                } else if(!isNaN(score2)) {
                    return 10 + score2;
                } else if(frame === 10){
                    if(score2 === 'X') {
                        return 20;
                    }
                } else {
                    return NaN;
                }
            }
        } else {
            if(currentFrame > frame) {
                var nextScore = calculateScores(player, frame + 1, 2);
                if(isNaN(nextScore)) {
                    frameScore = NaN;
                    document.getElementById('score_' + player).textContent = totalScore;
                } else {
                    frameScore = 10 + nextScore;
                }
            } else {
                if(frame === 10) {
                    if(score2 === 'X') {
                        if(score3 === 'X') {
                            frameScore = 30;
                        } else if(!isNaN(score3)) {
                            frameScore = 20 + score3;
                        }
                    } else if(!isNaN(score2)) {
                        if(score3 === 'X') {
                            frameScore = 20 + score2;
                        } else if(!isNaN(score3)) {
                            frameScore = 10 + score2 + score3;
                        }
                    }
                } else {
                    frameScore = NaN;
                    document.getElementById('score_' + player).textContent = totalScore;
                }
            }
        }
    } else {
        if(checkingNext === 1) {
            return score1;
        } else if(frame === 10) {
            if(score2 === '/') {
                if(score3 === 'X') {
                    frameScore = 20;
                } else if(!isNaN(score3)) {
                    frameScore = 10 + score3;
                }
            } else if(!isNaN(score2)) {
                frameScore = score1 + score2;
            }
        } else if(score2 === '/') {
            if(currentFrame > frame) {
                frameScore = 10 + calculateScores(player, frame + 1, 1);
                if(checkingNext === 2) {
                    return frameScore;
                }
            } else {
                frameScore = NaN;
                document.getElementById('score_' + player).textContent = totalScore;
                return NaN;
            }
        } else if(isNaN(score2)) {
            frameScore = NaN;
            document.getElementById('score_' + player).textContent = totalScore;
            return NaN;
        } else {
            frameScore = score1 + score2;
            if(checkingNext === 2) {
                return frameScore;
            }
        }
    }
    if(!isNaN(frameScore)) {
        totalScore += frameScore;
        document.getElementById('frame_' + player + '_' + frame + '_total').textContent = totalScore;
        document.getElementById('score_' + player).textContent = totalScore;
        console.log('test');
        if(frame < 10) {
            calculateScores(player, frame + 1, 0);
        }
        else return;
    }

}

function validateScore(score, inputFrame, frame, playerid) {
    if(score === '') {
        return false;
    }
    if(inputFrame === 1){
        return !isNaN(score) || score === 'X';
    } else {
        var input_1 = document.getElementById('frame_' + playerid + '_' + frame + '_1').textContent;
        if(frame === 10) {
            if(inputFrame === 3) {
                var input_2 = document.getElementById('frame_' + playerid + '_10_2').textContent;
                if(input_1 === 'X') {
                    if(input_2 === 'X') {
                        return !isNaN(score) || score === 'X';
                    } else {
                        return !isNaN(score) || score === '/';
                    }
                } else {
                    return !isNaN(score) || score === 'X';
                }
            } else {
                if(input_1 === 'X') {
                    return !isNaN(score) || score === 'X';
                } else {
                    if(!isNaN(score)) {
                        if(parseInt(input_1) + parseInt(score) === 10) {
                            document.getElementById('frame_' + playerid + '_' + frame + '_2').textContent = '/';
                            return true;
                        } else {
                            return parseInt(input_1) + parseInt(score) < 10;
                        }
                    } else {
                        return score === '/';
                    }
                }
            }
            if(input_1 === 'X') {
                if(inputFrame === 2) {
                    return !isNaN(score || score === 'X');
                }
            }
        } else if(inputFrame === 2) {
            if(!isNaN(score)) {
                if(parseInt(input_1) + parseInt(score) === 10) {
                    document.getElementById('frame_' + playerid + '_' + frame + '_2').textContent = '/';
                    return true;
                } else {
                    return parseInt(input_1) + parseInt(score) < 10;
                }
            } else {
                return score === '/';
            }
        }
    }
}

function nextMove(lastPlayer, frame) {
    var nextPlayer;
    var nextFrame;
    if(lastPlayer == numPlayers - 1) {
        if(frame < 10) {
            nextPlayer = 0;
            nextFrame = parseInt(frame) + 1;
        } else {
            endGame();
            return;
        }
    } else {
        nextPlayer = parseInt(lastPlayer) + 1;
        nextFrame = frame;
    }
    currentFrame = nextFrame;
    var next = document.getElementById('frame_' + nextPlayer + '_' + nextFrame + '_1');
    makeEditable(next);
}

function endGame() {
    var highscore = 0;
    var score = 0;
    var player = 0;
    for(var i = 0; i < numPlayers; i++) {
        score = parseInt(document.getElementById('score_' + i).textContent);
        if(score > highscore) {
            highscore = score;
            player = i;
        }
    }
    var playerName = document.getElementById('name_' + player).textContent;
    var end = confirm('Game Over! The winner is:\n' + playerName + ', with ' + highscore + 'points!\n\nWould you like to play again?');
    if(end) {
        location.reload();
    }
}
