$(function() {
  var Photo = function(path) {
    this.path = path;
    this.votes = 1;
  }

  Photo.prototype.vote = function() {
    return ++this.votes;
  }

  var Tracker = function() {
    this.photos = [];

    var xhr = $.ajax({
      dataType: 'json',
      headers: { Authorization: 'Client-ID a5ed186e4fdf274' },
      url: 'https://api.imgur.com/3/album/DDoWy',
      context: this
    });

    xhr.done(function(response) {
      if (response.status === 200) {
        var images = response.data.images;

        for (var i = 0; i < images.length; i++) {
          this.photos.push(new Photo(images[i].link));
        }

        this.voting();
      }
    });

    var context = $('#middle')[0].getContext('2d');
    this.chart = new Chart(context).Doughnut([
      {
        value: 1,
        color: '#e74c3c',
        highlight: '#c0392b',
        label: 'Red'
      },
      {
        value: 1,
        color: '#3498db',
        highlight: '#2980b9',
        label: 'Blue'
      }
    ]);

    this.$left = $('#left');
    this.$right = $('#right');
    this.$winner = $('#winner');
    this.$next = $('#next');
  }

  Tracker.prototype.isVoting = function() {
    return this.state === 'voting';
  }

  Tracker.prototype.isProclaiming = function() {
    return this.state === 'proclaiming';
  }

  Tracker.prototype.voting = function() {
    this.state = 'voting';
    this.selectKittens();
    this.drawKittens();
    this.resetResults();
    this.updateChart();
  }

  Tracker.prototype.proclaiming = function(winner) {
    this.state = 'proclaiming';
    this.declareResults(this.castVote(winner));
    this.updateChart();
  }

  Tracker.prototype.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  Tracker.prototype.selectKittens = function() {
    var left = this.getRandomInt(0, this.photos.length);
    var right = this.getRandomInt(0, this.photos.length);

    while (left === right) {
      right = this.getRandomInt(0, this.photos.length);
    }

    this.left = this.photos[left];
    this.right = this.photos[right];
  }

  Tracker.prototype.drawKittens = function() {
    this.$left.css({
      cursor: 'pointer',
      borderColor: '#3498db',
      backgroundImage: 'url(' + this.left.path + ')'
    });

    this.$right.css({
      cursor: 'pointer',
      borderColor: '#e74c3c',
      backgroundImage: 'url(' + this.right.path + ')'
    });
  }

  Tracker.prototype.updateChart = function() {
    this.chart.segments[1].value = this.left.votes;
    this.chart.segments[0].value = this.right.votes;
    this.chart.update();
  }

  Tracker.prototype.resetResults = function() {
    this.$winner.css('display', 'none');
    this.$next.css('display', 'none');
  }

  Tracker.prototype.castVote = function(winner) {
    if (winner === 'left') {
      this.left.vote();

      this.$left.css({
        cursor: 'auto',
        borderColor: '#3498db'
      });

      this.$right.css({
        cursor: 'auto',
        borderColor: 'white'
      });

      return 'Blue wins!';
    } else {
      this.right.vote();

      this.$right.css({
        cursor: 'auto',
        borderColor: '#e74c3c'
      });

      this.$left.css({
        cursor: 'auto',
        borderColor: 'white'
      });

      return 'Red wins!';
    }
  }

  Tracker.prototype.declareResults = function(message) {
    this.$winner.css({
      display: 'block',
      textContent: message
    });

    this.$next.css('display', 'inline-block');
  }

  var tracker = new Tracker();

  var vote = function() {
    if (tracker.isProclaiming()) {
      return;
    }

    tracker.proclaiming(this.id);
  }

  var declare = function() {
    if (tracker.isVoting()) {
      return;
    }

    tracker.voting();
  }

  $('#left, #right').on('click', vote);
  $('#next').on('click', declare);
});
