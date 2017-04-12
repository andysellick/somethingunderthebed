/* globals dataLayer */

var app = window.app || {};

app = {
	debug:0, //set to 1 to make the game unloseable
	timer:0, //main game loop timer
	loopspeed:100, //main game loop speed
	level:0,
	roundlength:17000, //time level lasts, 17000 is good
	monstermove:100, //% distance far a monster moves from current position
	monsterspeed:2000, //how quickly monsters appear
	monsterretreat:400, //how quickly monsters disappear
	ingame:0, //monitors whether in game or in dialog
	gameendtimer:null, //end game condition timer
	endgametime:2500, //time between monster fully appearing and game ending
	monstercount:3, //can be used to alter number of monsters per level
	monsters:[
		{	'id':'mon1',
			'pos':0,
			'threat':0,
			'active':1
		},
		{	'id':'mon2',
			'pos':0,
			'threat':0,
			'active':1
		},
		{	'id':'mon3',
			'pos':0,
			'threat':0,
			'active':1
		},
		{	'id':'mon4',
			'pos':0,
			'threat':0,
			'active':1
		},
		{	'id':'mon5',
			'pos':0,
			'threat':0,
			'active':1
		},
		{	'id':'mon6',
			'pos':0,
			'threat':0,
			'active':1
		},
		{	'id':'mon7',
			'pos':0,
			'threat':0,
			'active':1
		},
		{	'id':'mon8',
			'pos':0,
			'threat':0,
			'active':1
		},
		{	'id':'mon9',
			'pos':0,
			'threat':0,
			'active':1
		},
	],
	levels: [
		{	'name':'9pm',
			'failmsg':'You didn\'t even make it past the first hour. That\'s pretty feeble.',
		},
		{	'name':'10pm',
			'failmsg':'Sometimes it\'s not clear whose side you\'re on. Or if you\'re even playing.',
		},
		{	'name':'11pm',
			'failmsg':'The child in your care is now digesting in the innards of some unspeakable monster. I hope you\'re satisfied.',
		},
		{	'name':'12am',
			'failmsg':'You made it to midnight! Pity that\'s less than halfway. Maybe try being better next time.',
		},
		{	'name':'1am',
			'failmsg':'It\'s a good job you\'re not really responsible for the life of this child, because you just let him be devoured. Nice work.',
		},
		{	'name':'2am',
			'failmsg':'Are you trying to get the kid eaten? Because that\'s what it looks like.',
		},
		{	'name':'3am',
			'failmsg':'Does the idea of a child being eaten by monsters bother you at all? Maybe you\'re the real monster here.',
		},
		{	'name':'4am',
			'failmsg':'If that was your kid in the bed I bet you\'d have tried harder.',
		},
		{	'name':'5am',
			'failmsg':'Hey, not bad. The kid still got eaten, but it looked like you were really trying.',
		},
		{	'name':'6am',
			'failmsg':'The sun was nearly up. So close, and yet so far.',
		},
		{	'name':'7am',
			'failmsg':'',
		},
	],
	
	sharefb: 'https://www.facebook.com/sharer/sharer.php?u=https%3A//builtvisible.com/wp-content/themes/builtvisible/src/custompages/monsters/',
	sharetw: 'https://twitter.com/home?status=I%20survived%20til%20',
	sharetw2: '%20-%20can%20you?%20https%3A//builtvisible.com/something-under-the-bed/',
	sharegp: 'https://plus.google.com/share?url=https%3A//builtvisible.com/wp-content/themes/builtvisible/src/custompages/monsters/',
	shareem: 'mailto:?subject=I%20survived%20to%20',
	shareem2: '%20-%20can%20you?&body=Play%20now:%20https%3A//builtvisible.com/something-under-the-bed/',
	sharewa: 'whatsapp://send?text=I survived to ',
	sharewa2: ' - can you? https://builtvisible.com/something-under-the-bed/',

	linkfb: '.js-fb',
	linktw: '.js-tw',
	linkgp: '.js-gp',
	linkem: '.js-em',
	linkwa: '.js-wa',

	//player is starting the game
	//or has clicked to continue to the next level
    startGame: function() {
		clearInterval(app.timer);
		$('#floor').removeClass('pregame');
		$('#bg').removeClass('gameover');
		$('#bg').removeClass('gamewon');
		app.displayLevelInfo();
		app.resetMonsters();
		app.keepScore();
		$('#messagewrap').hide();
		$('.message').addClass('hidden');
		app.thisround = app.roundlength;
		app.ingame = 1;
		app.updateClock(1);
		stopScroll();
		app.timer = setInterval(app.loopMonsters,app.loopspeed);
	},

	//game is over, player has lost
	gameOver: function(){
		if(!app.debug){
			clearInterval(app.timer);
			app.ingame = 0;
			startScroll();
			app.displayLevelInfo();
			app.resetClock();
			app.updateClock(0);
			app.resetClockSpecific();
			$('#bg').addClass('gameover');
			dataLayer.push({'levelachieved': app.levels[app.level].name});
			$('#gameover').click();
			setTimeout(app.gameOverOver,1000);
		}
	},

	gameOverOver: function(){
		$('#messagewrap').show();
		$('#gameover').removeClass('hidden');
		app.updateSocial();
	},

	//player has reached the end of the level, stop and show dialog
	endLevel: function(){
		//console.log('endLevel');
		app.ingame = 0;
		startScroll();
		clearInterval(app.timer);
		app.displayLevelInfo();
		app.resetMonsters();
		app.keepScore();
		app.level++;
		app.monsterspeed = Math.max(300,app.monsterspeed - 160);
		app.monstercount = Math.min(app.monstercount + 1,app.monsters.length);
		//app.loopspeed = Math.max(app.loopspeed - 100, 50);
		if(app.level < app.levels.length - 1){
			$('#messagewrap').show();
			$('#nextlevel').removeClass('hidden');
		}
		else {
			app.youWon();
		}
	},

	//game is won, reset everything and display success message
	youWon: function(){
		//console.log('youWon');
		clearInterval(app.timer);
		app.ingame = 0;
		startScroll();
		$('#messagewrap').show();
		$('#gamewon').removeClass('hidden');
		$('#bg').addClass('gamewon');
		app.updateSocial();
		dataLayer.push({'levelachieved': app.levels[app.level].name});
		$('#gameover').click();
	},

	//restore game to default settings
	//FIXME probably a better way of doing this than re-hardcoding the values
	resetGame: function(){
		clearInterval(app.timer);
		app.level = 0;
		app.monstercount = 3; //set number of monsters back to normal
		app.monsterspeed = 2000; //set monster speed back to normal
		//app.loopspeed = 700;
		app.thisround = app.roundlength; //set game speed back to normal
		app.resetMonsters();
		$('#messagewrap').hide();
		$('.message').addClass('hidden');
		app.keepScore();
		app.displayLevelInfo();
		app.resetClock();
	},

	updateSocial: function(){
		$(app.linkfb).each(function(){
			$(this).attr('href',app.sharefb + app.levels[app.level].name + '.html');
		});
		$(app.linkwa).each(function(){
			$(this).attr('href',app.sharewa + app.levels[app.level].name + app.sharewa2);
		});
		$(app.linktw).each(function(){
			$(this).attr('href',app.sharetw + app.levels[app.level].name + app.sharetw2);
		});
		$(app.linkgp).each(function(){
			$(this).attr('href',app.sharegp + app.levels[app.level].name + '.html');
		});
		$(app.linkem).each(function(){
			$(this).attr('href',app.shareem + app.levels[app.level].name + app.shareem2);
		});
	},

	updateClock: function(incr){
		var clock = $('#clock');
		var nextlevel = app.levels[app.level + incr].name;
		clock.attr('class','clockwrap time' + nextlevel);
		clock.find('.mins').stop(true,true).addClass('active').animate({
			'opacity':1
		},app.roundlength, function(){
            $(this).removeClass('active');
        });
	},

	resetClock: function(){
		var clock = $('#clock');
		clock.attr('class','clockwrap reset').find('.mins').removeClass('active');
	},

	resetClockSpecific: function(){
		var clock = $('#clock');
		clock.attr('class','clockwrap reset').find('.mins').removeClass('active');
		var nextlevel = app.levels[app.level].name;
		clock.attr('class','clockwrap time' + nextlevel);
		clock.find('.mins').stop(true,true).addClass('active').animate({
			'opacity':1
		},0, function(){
            $(this).removeClass('active');
        });
	},

	displayLevelInfo: function(){
		$('.js-levelcount').html(app.levels[app.level + 1].name);
		$('.js-levelcount2').html(app.levels[app.level].name);
		$('.js-levelmsg').html(app.levels[app.level].failmsg);
	},

	//main game timer loop
	loopMonsters: function(){
		//console.log('loopMonsters');
		if(app.thisround > 0){
			app.thisround -= app.loopspeed;
			var which = app.randNum(0,app.monstercount - 1);
			if(which < app.monsters.length){
				if(app.monsters[which].active){
					var monster = $('#' + app.monsters[which].id);
					app.monsters[which].pos = Math.min(100,app.monsters[which].pos + app.monstermove);
					monster.find('.in').animate({
						'height': app.monsters[which].pos + '%'
					},app.monsterspeed,function(){
						app.monsters[which].threat = 1;
					});
				}
			}
			app.keepScore();
		}
		else {
			app.updateSocial();
			app.endLevel();
		}
	},
	
	//determine if game should end or not
	keepScore: function(){
		var threat = 100;
		for(var m = 0; m < app.monstercount; m++){ //check to see if any monster is fully revealed
			if(app.monsters[m].threat > 0){
				threat = 0;
				break;
			}
		}
		//if monster out, begin countdown to endgame
		//console.log(threat);
		if(threat === 0){
			if(app.gameendtimer === null){
				$('#threat').stop(true,false).animate({
					'width':threat + '%'
				},app.endgametime);
				app.gameendtimer = setTimeout(app.gameOver,app.endgametime);
			}
		}
		//cancel endgame timer, continue with game
		else {
			$('#threat').stop(true,false).animate({
				'width':threat + '%'
			},500);
			clearTimeout(app.gameendtimer);
			app.gameendtimer = null;
		}
	},

	//hide monster when clicked
	clickMonster: function(el){
		if(app.ingame){
			var mid = el.attr('id');
			var found = 0;
			for(var x = 0; x < app.monsters.length; x++){
				if(app.monsters[x].id === mid){
					found = x;
					break;
				}
			}
			app.monsters[found].pos = 0;
			app.monsters[found].active = 0;
			app.monsters[found].threat = 0;
			var elin = el.find('.in');
			elin.stop(true,false).addClass('hit').animate({
				'height':app.monsters[found].pos + '%'
			},app.monsterretreat,function(){
				app.monsters[found].active = 1;
				elin.removeClass('hit');
			});
		}
	},
	
	//return all monsters to default state
	resetMonsters: function(){
		for(var z = 0; z < app.monsters.length; z++){
			app.monsters[z].pos = 0;
			app.monsters[z].threat = 0;
			app.monsters[z].active = 1;
		}
		$('.monster').each(function(){
			$(this).find('.in').stop(true,false).animate({
				'height':'0%'
			},app.monsterretreat).removeClass('hit');
		});
	},

	randNum: function(min,max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	//fade out the splash screen as the game loads
	hideSplash: function(){
		$('#mask').fadeIn(700,function(){
			$('#logowrap').fadeOut(700,function(){
                $('#intro').removeClass('hidden');
            });
		});
	}

};

/* http://stackoverflow.com/questions/10592411/disable-scrolling-in-all-mobile-devices */
function preventMotion(event){
    window.scrollTo(0, 0);
    event.preventDefault();
    event.stopPropagation();
}
function stopScroll(){
	window.addEventListener('scroll', preventMotion, false);
	window.addEventListener('touchmove', preventMotion, false);
}
function startScroll(){
	window.removeEventListener('scroll', preventMotion, false);
	window.removeEventListener('touchmove', preventMotion, false);
}

$(document).ready(function() {
	app.displayLevelInfo();

	//http://stackoverflow.com/questions/280049/javascript-callback-for-knowing-when-an-image-is-loaded
	function loaded(){
		setTimeout(app.hideSplash,2000);
	}
	var img = document.querySelector('img');
	if(img.complete){
		loaded();
	}
	else {
		img.addEventListener('load', loaded);
		img.addEventListener('error', function() {
			setTimeout(app.hideSplash,2000);
		});
	}

    $('.js-startgame').on('click touchstart',function(e){
		e.preventDefault();
		app.startGame();
	});

    $('.js-startover').on('click touchstart',function(e){
		e.preventDefault();
		app.resetGame();
		app.startGame();
	});
	
	$('.js-resetclock').on('click touchstart',function(e){
		app.resetClock();
		app.updateClock(1);
	});

	$('.monster').find('.in').on('click touchstart',function(e){
		e.preventDefault();
		e.stopPropagation();
		app.clickMonster($(this).parent());
	});
	
	$('.js-share').on('click',function(e){
		e.preventDefault();
		$('.js-sharing').removeClass('hidden');
	});
	
	$('.linkbox').focus(function(){
		$(this).select();
	});
	
	$('.js-close').on('click',function(e){
		e.preventDefault();
		$('#sharing').addClass('hidden');
	});

	/*
		b - 1
		d - 2
		t - 3
		a - 4
		x - 5
		m - 6
		w - 7
		o - 8
		g - 9
	*/
	var keyd = [98,100,116,97,120,109,119,111,103];
	$(document).keypress(function(e){
		var code = e.keyCode || e.which;
		var findcode = keyd.indexOf(code);
		//console.log(code,findcode);
		if(findcode !== -1){
			findcode++;
			app.clickMonster($('#mon' + findcode));
		}
		if(code === 32 && app.ingame === 0 ){
			//app.startGame();
			if(!$('#nextlevel').hasClass('hidden')){
				$('.js-startgame').click();
			}
		}
	});
});

/*
Embedding:

<style>
.rwrap {position:relative;height:0;padding-bottom:70%;margin-bottom:30px;}
.rwrap .r {position:absolute;top:0;left:0;width:100%;height:100%;}
</style>
<div class="rwrap">
<iframe class="r" src="https://builtvisible.com/something-under-the-bed/" style="border:0;overflow:hidden;" scrolling="no"></iframe>
</div>
*/
