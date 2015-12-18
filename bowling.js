'use strict';

var currentFrame = 0;
var numPlayers = 0;
var bowlingModel;

// Class to represent a row in the bowling scorecard
function Player(playername, id) {
    var self = this;
    self.playername = ko.observable(playername);
    self.playerid = id;
    self.editable = ko.observable(true);
    self.score = ko.observable(0);
    self.frames = ko.observableArray([
        new Frame(0, self),
        new Frame(1, self),
        new Frame(2, self),
        new Frame(3, self),
        new Frame(4, self),
        new Frame(5, self),
        new Frame(6, self),
        new Frame(7, self),
        new Frame(8, self),
        new Frame(9, self)
    ]);

    self.onInput = function(data, e) {
        self.playername(e.target.innerText);
        return true;
    }

    self.calculateScore = function() {
        var totalScore = 0;
        self.frames().forEach(function(frame) {
            totalScore += frame.calculateScore();
            if(frame.score() !== '') {
                frame.totalscore(totalScore);
            }
        });
        self.score(totalScore);
        return totalScore;
    }
}

function Frame(frame, player) {
    var self = this;
    self.frameNumber = frame;
    self.player = ko.observable(player);
    self.score = ko.observable('');
    self.totalscore = ko.observable('');
    if(self.frameNumber < 9) {
        self.inputFrames = ko.observableArray([
            new inputFrame(2, self),
            new inputFrame(1, self)
        ]);
    } else {
        self.inputFrames = ko.observableArray([
            new inputFrame(3, self),
            new inputFrame(2, self),
            new inputFrame(1, self)
        ]);
    }

    self.calculateScore = function() {
        var score_1;
        var score_2;
        var futures;
        var score;
        if(self.frameNumber === 9) {
            score_1 = self.inputFrames()[2].score();
            score_2 = self.inputFrames()[1].score();
            var score_3 = self.inputFrames()[0].score();
            if(score_1 === '' || score_2 === '') {
                score = '';
            } else if(score_1 === 'X') {
                if(score_2 === 'X') {
                    if(score_3 === '') {
                        score = '';
                    } else if(score_3 === 'X') {
                        score = 30;
                    } else {
                        score = 20 + score_3;
                    }
                } else {
                    if(score_3 === '') {
                        score = '';
                    } else if(score_3 === '/') {
                        score = 20;
                    } else {
                        score = 10 + score_2 + score_3;
                    }
                }
            } else if(score_2 === '/') {
                if(score_3 === '') {
                    score = '';
                } else if(score_3 === 'X') {
                    score = 20;
                } else {
                    score = 10 + score_3;
                }
            } else {
                score = score_1 + score_2;
            }
        } else {
            score_1 = self.inputFrames()[1].score();
            score_2 = self.inputFrames()[0].score();
            if(score_1 === 'X') {
                futures = self.checkFutures(2);
                if(futures === null) {
                    score = '';
                } else {
                    score = 10 + futures;
                }
            } else {
                if(score_2 === '') {
                    score = '';
                } else if(score_2 === '/') {
                    futures = self.checkFutures(1);
                    if(futures === null) {
                        score = '';
                    } else {
                        score = 10 + futures;
                    }
                } else {
                    score = score_1 + score_2;
                }
            }
        }
        self.score(score);
        return score;
    }

    self.checkFutures = function(rounds) {
        var nextFrame = self.player().frames()[self.frameNumber + 1];
        var score_1;
        var score_2;
        if(nextFrame.frameNumber === 9) {
            score_1 = nextFrame.inputFrames()[2].score();
            if(score_1 === '') {
                return null;
            } else if(rounds === 2) {
                score_2 = nextFrame.inputFrames()[1].score();
                if(score_2 === '') {
                    return null;
                } else if(score_1 === 'X') {
                    if(score_2 === 'X') {
                        return 20;
                    } else {
                        return 10 + score_2;
                    }
                } else {
                    if(score_2 === '/') {
                        return 10;
                    } else {
                        return score_1 + score_2;
                    }
                }
            } else {
                if(score_1 === 'X') {
                    return 10;
                } else {
                    return score_1;
                }
            }
        } else {
            score_1 = nextFrame.inputFrames()[1].score();
            if(score_1 === '') {
                return null;
            } else if(score_1 === 'X') {
                if(rounds === 2) {
                    nextFrame = self.player().frames()[self.frameNumber + 2];
                    if(nextFrame.frameNumber === 9) {
                        score_2 = nextFrame.inputFrames()[2].score();
                    } else {
                        score_2 = nextFrame.inputFrames()[1].score();
                    }
                    if(score_2 === '') {
                        return null;
                    } else if(score_2 === 'X') {
                        return 20;
                    } else {
                        return 10 + score_2;
                    }
                } else {
                    return 10;
                }
            } else if(rounds === 2) {
                score_2 = nextFrame.inputFrames()[0].score();
                if(score_2 === '') {
                    return null;
                } else if(score_2 === '/') {
                    return 10;
                } else {
                    return score_1 + score_2;
                }
            } else {
                if(score_1 === 'X') {
                    return 10;
                } else {
                    return score_1;
                }
            }
        }
    }
}

function inputFrame(ball, frame) {
    var self = this;
    self.ball =  ko.observable(ball);
    self.frame =  ko.observable(frame);
    self.focus =  ko.observable(false);
    self.editable =  ko.observable(false);
    self.score =  ko.observable('');
    self.active = ko.observable(false);

    self.makeEditable = function() {
        self.editable(true);
        self.focus(true);
        self.active(true);
    }

    self.onKeyDown = function(data, e) {
        if(e.keyCode === 13) {
            e.preventDefault();
            self.submitScore(e.target.innerText.toUpperCase());
        } else if(e.keyCode != 8 && e.target.innerText.length > 0) {
            e.preventDefault();
        } else {
            return true;
        }
    }

    self.submitScore = function(score) {
        if(!isNaN(score)) {
            score = parseInt(score);
        }
        if(self.validateScore(score)) {
            var frame = self.frame();
            if(self.score() !== '/') {
                self.score(score);
            }
            frame.calculateScore();
            frame.player().calculateScore();
            self.active(false);
            if(frame.frameNumber === currentFrame) {
                if((frame.frameNumber < 9 && (self.score() === 'X' || self.ball() > 1)) || frame.frameNumber === 9 && self.ball() === 3) {
                    self.nextMove();
                } else {
                    var next;
                    if(frame.frameNumber === 9) {
                        if(self.ball() === 2) {
                            next = frame.inputFrames()[0];
                            if(self.score() !== 'X' && self.score() !== '/') {
                                bowlingModel.endGame();
                            } else {
                                next.makeEditable();
                            }
                        } else {
                            next = frame.inputFrames()[1];
                            next.makeEditable();
                        }
                    }  else {
                        next = frame.inputFrames()[self.ball() - 1];
                        next.makeEditable();
                    }
                }
            }
        } else {
            alert('Error: invalid score: ' + score + '.  Please enter 0-9, /, or X in the appropriate square.');
            self.score('');
            self.focus(true);
        }
    }

    self.nextMove = function() {
        var next;
        if(self.frame().player().playerid === numPlayers) {
            if(self.frame().frameNumber < 9) {
                if(self.frame().frameNumber < 8) {
                    currentFrame++;
                    next = bowlingModel.players()[0].frames()[self.frame().frameNumber + 1].inputFrames()[1];
                } else {
                    currentFrame++;
                    next = bowlingModel.players()[0].frames()[self.frame().frameNumber + 1].inputFrames()[2];
                }
            } else {
                bowlingModel.endGame();
                return;
            }
        } else {
            if(self.frame().frameNumber === 9) {
                next = bowlingModel.players()[self.frame().player().playerid + 1].frames()[self.frame().frameNumber].inputFrames()[2];
            } else {
                next = bowlingModel.players()[self.frame().player().playerid + 1].frames()[self.frame().frameNumber].inputFrames()[1];
            }
        }
        next.makeEditable();
    }

    self.validateScore = function(score) {
        if(score === '') {
            return false;
        } else if(self.ball() === 1) {
            return !isNaN(score) || score === 'X';
        } else {
            var score_1 = self.frame().inputFrames()[1].score();
            if(self.frame().frameNumber === 9) {
                score_1 = self.frame().inputFrames()[2].score();
                if(self.ball() === 3) {
                    var score_2 = self.frame().inputFrames()[1].score();
                    if(score_1 === 'X') {
                        if(score_2 === 'X') {
                            return !isNaN(score) || score === 'X';
                        } else {
                            return !isNaN(score) || score === '/';
                        }
                    } else {
                        return !isNaN(score) || score === 'X';
                    }
                } else {
                    if(score_1 === 'X') {
                        return !isNaN(score) || score === 'X';
                    } else {
                        if(!isNaN(score)) {
                            if(score_1 + score === 10) {
                                self.score('/');
                                return true;
                            } else {
                                return score_1 + score < 10;
                            }
                        } else {
                            return score === '/';
                        }
                    }
                }
            } else if(self.ball() === 2) {
                if(!isNaN(score)) {
                    if(score_1 + score === 10) {
                        self.score('/');
                        return true;
                    } else {
                        return score_1 + score < 10;
                    }
                } else {
                    return score === '/';
                }
            }
        }
    }
}

// Overall viewmodel for this screen, along with initial state
function BowlingViewModel() {
    var self = this;
    self.displayControls = ko.observable(true);

    // Editable data
    self.players = ko.observableArray([
        new Player("", 0)
    ]);

    self.addPlayer = function() {
        if(self.players().length < 5) {
            numPlayers++;
            self.players.push(new Player("", numPlayers));
        } else {
            alert('Error: only 5 players are supported, sorry!');
        }
    }

    self.removePlayer = function() {
        if(self.players().length > 1){
            self.players.pop();
            numPlayers--;
        } else {
            alert('Error: You must have at least one player!');
        }
    }

    self.startGame = function() {
        var confirm = window.confirm('Are you sure you want to start the game? You won\'t be able to add any more players or edit player names anymore.');
        if(confirm === true) {
            self.displayControls(false);
            self.players().forEach(function(player) {
                player.editable(false);
            });
            self.players()[0].frames()[0].inputFrames()[1].makeEditable();
        }
    }

    self.endGame = function() {
        var highscore = 0;
        var score = 0;
        var topPlayer = 0;
        var tiedPlayers = '';
        var end;
        self.players().forEach(function(player) {
            score = player.score();
            if(score > highscore) {
                console.log(player);
                tiedPlayers = '';
                highscore = score;
                topPlayer = player.playername();
            } else if(score === highscore) {
                if(tiedPlayers.length > 0) {
                    tiedPlayers += ', ' + player.playername();
                } else {
                    tiedPlayers = player.playername();
                }

            }
        });
        if(tiedPlayers.length > 0) {
            end = confirm('Game Over! There was a tie! The following players are the winners:\n' + topPlayer + ', ' + tiedPlayers + ', with ' + highscore + 'points!\n\nWould you like to play again?');
        } else {
            end = confirm('Game Over! The winner is:\n' + topPlayer + ', with ' + highscore + 'points!\n\nWould you like to play again?');
        }
        if(end) {
            location.reload();
        }
    }
}

/*
 * setup function:
 * Initializes player names as contenteditables and sets up click handlers on control buttons
 */

function setup() {
    bowlingModel = new BowlingViewModel();
    ko.applyBindings(bowlingModel);

}
