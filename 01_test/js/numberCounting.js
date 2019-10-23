(function($){
    $.fn.numberCounting = function(pOption){
        $.defaultOption = {
            items: $(this),
			counting: $(this).html(),
            terms: 10000,
			countingTime: 100
        }
		 pOption = $.extend(null, $.defaultOption, pOption);
		var counting = new Counting(pOption);
    }
    
	function Counting(myOption){
		this.options = {
			items: null,
			counting: null,
			terms: null,
			countingTime: null
		}
		this.init(myOption);
	}

	Counting.prototype.init = function(myOption){
		this.options.items = myOption.items;
		this.options.counting = myOption.counting;
		this.options.terms = myOption.terms;
		this.options.countingTime = myOption.countingTime;
		this.numberStart();
	}

	Counting.prototype.numberStart = function(){
		var lStartNum = this.options.counting - this.options.terms;
		var lThis = this;
		var lTimer = null;
		this.options.items.html(lStartNum);
		numberUp();

		function numberUp(){
			var lNowNum = lThis.options.items.html();
			if(lTimer) clearTimeout(lTimer);

			if(lThis.options.counting != lNowNum){
				lNowNum++;
				lThis.options.items.html(lNowNum);
				lTimer = setTimeout(numberUp, lThis.countingTime);
			}
		}
	}


})(jQuery)

