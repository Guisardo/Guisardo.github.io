var computingStrategy = 0;
function ComputeStrategy()
{
    clearTimeout(computingStrategy);
	computingStrategy = setTimeout(function(){
		var Decks   = $('#decks').val();
		var Soft17  = $('#soft17').val();
		var DAS     = $('#das').val();
		var Surr    = $('#surr').val();
		var Peek    = $('#peek').val();
		if($('.swiper-container').length > 0)
		{
			$('#strategy > div').html(BjStrategy.getStrategy((Decks>2?2:Decks), Soft17, DAS, Surr, Peek));
			$('#strategy').css('max-width', $('#lossGraph').width());
			mySwiper.reInit();
			mySwiper.swipeReset();
		}
		Storage.set('bjStrategyParams', {
			'decks': Decks,
			'soft17': Soft17,
			'das': DAS,
			'surr': Surr,
			'peek': Peek
		});
		
		$('#strategy table tr').find('td:gt(8):lt(2)').click(function(){
			updateWeight(-1);
			});
		$('#strategy table tr').find('td:gt(0):lt(1), td:gt(5):lt(1)').click(function(){
			updateWeight(0.5);
			});
		$('#strategy table tr').find('td:gt(1):lt(2), td:gt(4):lt(1)').click(function(){
			updateWeight(1);
			});
		$('#strategy table tr').find('td:gt(3):lt(1)').click(function(){
			updateWeight(1.5);
			});
		$('#strategy table tr').find('td:gt(6):lt(1)').click(function(){
			updateWeight(0);
			});
		$('#strategy table tr').find('td:gt(7):lt(1)').click(function(){
			updateWeight(-0.5);
			});
		
		
		$('#strategy table tr').find('th:gt(8):lt(2)').click(function(){
			BjStrategy.removeWeight(-1);
			$('#tip span').text(BjStrategy.getWeight($('#decks').val()).toFixed(2));
			});
		$('#strategy table tr').find('th:gt(0):lt(1), th:gt(5):lt(1)').click(function(){
			BjStrategy.removeWeight(0.5);
			$('#tip span').text(BjStrategy.getWeight($('#decks').val()).toFixed(2));
			});
		$('#strategy table tr').find('th:gt(1):lt(2), th:gt(4):lt(1)').click(function(){
			BjStrategy.removeWeight(1);
			$('#tip span').text(BjStrategy.getWeight($('#decks').val()).toFixed(2));
			});
		$('#strategy table tr').find('th:gt(3):lt(1)').click(function(){
			BjStrategy.removeWeight(1.5);
			$('#tip span').text(BjStrategy.getWeight($('#decks').val()).toFixed(2));
			});
		$('#strategy table tr').find('th:gt(6):lt(1)').click(function(){
			BjStrategy.removeWeight(0);
			$('#tip span').text(BjStrategy.getWeight($('#decks').val()).toFixed(2));
			});
		$('#strategy table tr').find('th:gt(7):lt(1)').click(function(){
			BjStrategy.removeWeight(-0.5);
			$('#tip span').text(BjStrategy.getWeight($('#decks').val()).toFixed(2));
			});
	}, 500);
}
function updateWeight(amount)
{
	BjStrategy.addWeight(amount);
	$('#tip span').text(BjStrategy.getWeight($('#decks').val()).toFixed(2));
}
var graphDrawing = false;
var initialDeltaX = null;
function drawGraph()
{
    clearTimeout(graphDrawing);
	graphDrawing = setTimeout(function(){
		historic = CycleHistory.getHistoricLosses();
		axisy = [];
		baseAxisLen = 70-historic.length;
		integral = 0;
		for(var i=(baseAxisLen>0?0:historic.length-70); i<historic.length; i++)
		{
			integral +=  historic[i]['event'] * 1;
			axisy.push(-integral.toFixed(2));	
		}
		if (initialDeltaX == null)
		{
			initialDeltaX = axisy.length;
		}
		for(var i=0; i<70-historic.length; i++)
		{
			axisy.push(-integral.toFixed(2));
		}
		for(var i=0; i<30; i++)
		{
			axisy.push(-integral.toFixed(2));
		}
		lowRange = {};
		lowRange[0]='blue';
		lowRange[(-Math.ceil($('#minBank').text()*80/100)-1)+':'+(-Math.ceil($('#minBank').text()*60/100))]='yellow';
		lowRange[':'+(-Math.ceil($('#minBank').text()*80/100))]='red';
		$('#lossGraph').sparkline(axisy, {'width': $('#lossGraph').width(), 'height': 45, valueSpots: lowRange, lineColor: 'white', lineWidth: 2, spotRadius: 3, fillColor: 'transparent'});
		
		dft = Cycle.getHistoricDft();
		if (dft.length > 0)
		{
			axisy_f = [];
			for(var i=-initialDeltaX; i<0; i++)
			{
				axisy_f.push(-computeInverseFourierTransform(i, dft));
			}		
			for(var i=0; i<100-initialDeltaX; i++)
			{
				axisy_f.push(-computeInverseFourierTransform(i, dft));
			}		
			$('#lossGraph').sparkline(axisy_f, {'width': $('#lossGraph').width(), 'height': 45, lineColor: 'yellow', lineWidth: 2, composite: true, fillColor: 'transparent'});
		}
	}, 500);
}
function resetLoss()
{
	Storage.flush();
	location.href = location.href;
}
var restInterval = 0;
function checkRest()
{
	isEnabled = Cycle.isEnabled();
	clearTimeout(restInterval);
	restInterval = 0;
	if(!isEnabled)
	{
		$('#restMsg').show().html('Take a rest. We may resume the game in ' + Cycle.getReactivationTime() + ' minute/s. You can "<a href=\'http://tipcodes.com/sites/all/modules/tipcodes/pay/?id=557\'>tip</a>" the author while resting ;)');
				
		$('.butttons_container input:not(#tip)').val('Rest');
		$('#next_bet').text('Rest');
		restInterval = setTimeout(drawLosses, 5000);	
	}
	else
	{
		if($('#next_bet').text() == "Rest")
		{
			location.href = location.href;
		}
		$('#restMsg').hide();
		restInterval = 0;
	}
	return isEnabled;
}
function addLoss(multiplier)
{
	if($('#currLoss').val() != '')
	{
		showOverlay();
		setTimeout(function(){
			var currLoss = $('#currLoss').val()*multiplier;
			Cycle.addLoss(currLoss, BjStrategy.getWeight($('#decks').val()));
			var msg = {
				text : "Lost",
				title : currLoss
			};
			if(currLoss<0)
			{
				msg = {
						text : "Win",
						title : (-currLoss)
				};
			}
			else if(currLoss==0)
			{
				msg = {
					text: "Tie"
				};
			}
			$.gritter.add(msg);
			updateNextBet();
			
			drawLosses();
	
			drawGraph();
			hideOverlay();
			

		}, 100);
	}
}
function addWin()
{
	if(Cycle.getTotalLoss() > 0)
	{
		Cycle.markWin();
		
		drawLosses();
	
		drawGraph();
	}
}
function updateNextBet()
{
	currLoss = Math.ceil(Cycle.getNextBet(BjStrategy.getWeight($('#decks').val())));
	if(currLoss % ($('#minUnit').val()*1) > 0)
	{
		currLoss -= currLoss % ($('#minUnit').val()*1);
		currLoss += ($('#minUnit').val()*1);
	}
	$('#currLoss').val(currLoss);
	myDragger.setValue(($('#currLoss').val() - $('#minBet').val()*1) / ($('#maxBet').val() - $('#minBet').val()))
}
function updateTops()
{
	$('#totalLoss').text('0');
	if ($('#minBet').val() != "")
	{
		$('#maxBet').attr("min", $('#minBet').val());
		$('#minBet').attr("max", $('#maxBet').val());
		$('#txtMinBet').text($('#minBet').val());
		$('#txtMaxBet').text($('#maxBet').val());
		$('#currLoss').attr("min", $('#minBet').val()).attr("max", $('#maxBet').val());
		Cycle.setOptions($('#minBet').val()*1, $('#maxBet').val()* 1);
		Storage.set("bjMinBet", $('#minBet').val());
		Storage.set("bjMaxBet", $('#maxBet').val());
		Storage.set("bjMinUnit", $('#minUnit').val());
		$('#minBank').text(Cycle.getIdealBankroll($('#minBet').val()*1));
		$('#nextBank').text(Cycle.getIdealBankroll($('#minBet').val()*1+10));
		
		if($('.swiper-container').length > 0)
		{
			updateNextBet();
		}
		drawLosses();
		if($('.swiper-container').length > 0)
		{
			drawGraph();
		}
	}
}

var nextBetMsgId = 0;
function drawLosses()
{
	if(checkRest())
	{
		var nextBet = $('#currLoss').val();
		$('#next_bet').text(nextBet);
		
		$('#totalLoss').text(Cycle.getTotalLoss().toFixed(2));
		$('#maxLoss').text(CycleHistory.getMaxLoss().toFixed(2));
		if($('#currLoss').val()*1 <= $('#minBet').val()*3)
		{
			$('.bjbscalc').removeClass('cycling');
		}
		else
		{
			$('.bjbscalc').addClass('cycling');
		}
		
		//console.log($(Cycle.getLosses()).each(function(){if(this.isCanceled()){console.log('-' + this.getAmount());}else {console.log(this.getAmount())}}));
	}
}
function undo()
{
	showOverlay();
	setTimeout(function(){	
		CycleHistory.undo($('#minBet').val(),$('#maxBet').val());
		updateNextBet();

		drawLosses();
		drawGraph();
		hideOverlay();
	}, 100);
}
function showOverlay()
{
	if($('#overlay').length == 0)
	{
		$('body').append($('<div/>').attr('id', 'overlay'));
	}
}
function hideOverlay()
{
	$('#overlay').remove();
}

var mySwiper;
var myDragger;
$(document).ready(function()
{
	showOverlay();
	setTimeout(function(){	
		
		$.extend($.gritter.options, { 
			class_name: 'gritter-small',
	        position: 'top-left', // defaults to 'top-right' but can be 'bottom-left', 'bottom-right', 'top-left', 'top-right' (added in 1.7.1)
			fade_in_speed: 'fast', // how fast notifications fade in (string or int)
			fade_out_speed: 'fast', // how fast the notices fade out
			time: 1000 // hang on the screen for...
		});
		
		if(Storage.get("bjMinBet") != null)
		{
			$('#minBet').val(Storage.get("bjMinBet"));
		}
		if(Storage.get("bjMaxBet") != null)
		{
			$('#maxBet').val(Storage.get("bjMaxBet"));
		}
		if(Storage.get("bjMinUnit") != null)
		{
			$('#minUnit').val(Storage.get("bjMinUnit"));
		}
		
		var bjStrategyParams = Storage.get('bjStrategyParams');
		if(bjStrategyParams != null)
		{
			$('#decks').val(bjStrategyParams['decks']);
			$('#soft17').val(bjStrategyParams['soft17']);
			$('#das').val(bjStrategyParams['das']);
			$('#surr').val(bjStrategyParams['surr']);
			$('#peek').val(bjStrategyParams['peek']);
		}
		if($('.swiper-container').length > 0)
		{
			myDragger = new Dragdealer('currBet-slider', {
				steps: ($('#maxBet').val() - $('#minBet').val()) / $('#minUnit').val() + 1,
				snap: true,
				right: 2,
				animationCallback: function(x, y) {
					newLoss = (($('#maxBet').val() - $('#minBet').val()) * x) + $('#minBet').val()*1;
					if (newLoss != $('#currLoss').val())
					{
						$('#currLoss').val(newLoss);
						drawLosses();
					}
				}
			});
			$(window).resize(function(){
				drawGraph();
				ComputeStrategy();
			});
			mySwiper = $('.swiper-container').swiper({
				//Your options here:
				mode:'horizontal',
				loop: true,
				keyboardControl:true
				//etc..
			  });	

			  ComputeStrategy();
			
			var size =$("#strategy table td").width();
			$("#strategy table  td").height(size);
		}
		updateTops();
		
	    $("#menu-close").click(function(e) {
	        e.preventDefault();
	        $("#strategema").removeClass("on");
	        $(".header").removeClass("on");
	        $("#strategema").show();
	        $(".header").hide();
	        $("#menu-close").hide();
	        $("#menu-toggle").show();
	    });
	    $("#menu-toggle").click(function(e) {
	        e.preventDefault();
	        $(".header").show();
	        $("#strategema").hide();
	        $("#strategema").addClass("on");
	        $(".header").addClass("on");
	        $("#menu-close").show();
	        $("#menu-toggle").show();
	    });
	    $(".header").hide();
	    
	    $(document).keypress(function(event){
	    	if(event.keyCode == 43)
    		{
	    		updateWeight(1);
    		}
	    	else if(event.keyCode == 45)
	    	{
	    		updateWeight(-1);
	    	}
	    });

	    hideOverlay();
	}, 100);
});
