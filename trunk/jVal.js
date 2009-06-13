/*
 * jVal - dynamic jquery form field validation framework
 *	version 0.1.4
 * Author: Jim Palmer
 * Released under MIT license.
 */
(function($) {
	this.showWarning = function (elements, message, autoHide, styleType) {
		var par = $(elements).eq(0).parent();
		clearTimeout( $(par).data('autoHide') ) && $(par).data('autoHide', null);
		$(par).jValClean().append('<div class="jValRelWrap" style="display:none;"></div>').find('.jValRelWrap').append( $(elements).clone() );
		$(elements).css({marginTop:'',position:'',borderColor:'red'});
		var fieldWidth = $(par).find('.jValRelWrap').width(), fieldHeight = $(par).find('.jValRelWrap').height();
		$(par).find('.jValRelWrap').css({width:fieldWidth,height:fieldHeight}).empty();
		var paddedHeight = (fieldHeight + ($.fn.jVal.defaultPadding * 2)),
			absoluteLeft = $(elements).eq(0).position().left,
			absoluteTop = $(elements).eq(0).position().top;
		$(elements).each(
			function () {
				absoluteLeft = Math.min( $(this).position().left, absoluteLeft );
				absoluteTop = Math.min( $(this).position().top, absoluteTop );
			}
		);
		$(elements).eq(0).before(
			'<div class="jfVal' + ( styleType ? ' jfVal' + styleType : '' ) + '" style="left:' + (absoluteLeft - $.fn.jVal.defaultPadding - $.fn.jVal.defaultBorderWidth) + 'px; ' +
				'top:' + (absoluteTop - $.fn.jVal.defaultPadding - $.fn.jVal.defaultBorderWidth + $.fn.jVal.IETopNudge) + 'px;">' +
				( (styleType == 'pod') ? '<div class="spacerBorder" style="height:' + paddedHeight + 'px;">' : '' ) +
					'<div class="spacer' +  ( styleType ? ' spacer' + styleType : '' ) + '" style="height:' + paddedHeight + 'px;"></div>' +
				( (styleType == 'pod') ? '</div>' : '' ) +
				'<div class="icon' + ( styleType ? ' icon' + styleType : '' ) + '" style="height:' + paddedHeight + 'px;"><div class="iconbg"></div></div>' +
				'<div class="content' + ( styleType ? ' content' + styleType : '' ) + '" style="height:' + paddedHeight + 'px; line-height:' + paddedHeight + 'px;">' +
					'<span class="message' + styleType + '">' + message + '</span>' +
				'</div>' +
			'</div>');
		var spacerWidth = fieldWidth + ($.fn.jVal.defaultPadding * 2) + 8;
		$(par).find(styleType == 'pod' ? '.spacerBorder' : '.jfVal').css({padding:parseInt($.fn.jVal.defaultBorderWidth) + 'px'});
		$(par).find('.jfVal').width( spacerWidth + $(par).find('.icon').width() + $(par).find('.content').width() + $.fn.jVal.defaultPadding + $.fn.jVal.defaultBorderWidth);
		// autoHide = set spacer width + add autohide function to fx queue
		if ( autoHide )
			$(par).data( 'autoHide', setTimeout(function () { $(par).find('.spacer').animate({width:10}, 200, function () { $(par).jValClean(); }); }, 2000) )
				.find('.spacer').width( spacerWidth );
		else
			$(par).find('.spacer').width( 10 ).animate({'width':spacerWidth}, 200);
		// reposition the elements since change to absolute
		$(elements).each(function () { $(this).css( $(this).position() ); })
			.css({position:'absolute'}).removeClass('jfValContentZ').addClass('jfValContentZ');
		$(par).find('.jValRelWrap').css({display:'block'});
	};
	function valKey (keyRE, e, cF, cA) {
		if ( !(keyRE instanceof RegExp) ) return false;
		if ( /^13$/.test(String(e.keyCode || e.charCode)) ) {
			try { (this[cF]) ? this[cF](cA) : eval(cF); } catch(e) { return true; }
			return -1;
		} else if (	e.ctrlKey || e.shiftKey || e.metaKey ||
					( typeof(e.keyCode) != 'undefined' && e.keyCode > 0 && keyRE.test(String.fromCharCode(e.keyCode)) ) ||
					( typeof(e.charCode) != 'undefined' && e.charCode > 0 && String.fromCharCode(e.charCode).search(keyRE) != (-1) ) ||
					( typeof(e.charCode) != 'undefined' && e.charCode != e.keyCode && typeof(e.keyCode) != 'undefined' && e.keyCode.toString().search(/^(8|9|45|46|35|36|37|39)$/) != (-1) ) ||
					( typeof(e.charCode) != 'undefined' && e.charCode == e.keyCode && typeof(e.keyCode) != 'undefined' && e.keyCode.toString().search(/^(8|9)$/) != (-1) ) ) {
			return 1;
		} else {
			return 0;
		}
	};
	$.fn.jVal = function () {
		$(this).stop().find('.jfVal').stop().remove();
		var passVal = true;
		$(this).find('.jVal,[jVal]:not(:disabled):visible').each(
			function () {
				var cmd = $(this).data('jVal');
				if ( typeof cmd !== 'object' ) eval( 'cmd = ' + ( $(this).data('jVal') || $(this).attr('jVal') ) + ';' );
				$(this).jValClean(cmd.target || this);
				if ( cmd instanceof Object && cmd.valid instanceof RegExp && !cmd.valid.test($(this).val()) ) {
					showWarning(cmd.target || this, cmd.message || $.fn.jVal.defaultMessage, cmd.autoHide || false, cmd.styleType || $.fn.jVal.defaultStylye);
					passVal = false;
				} else if ( cmd instanceof Object && cmd.valid instanceof Function ) {
					var testFRet = cmd.valid( $(this).val(), this );
					if ( testFRet === false || testFRet.length > 0 ) {
						showWarning(cmd.target || this, testFRet || cmd.message || $.fn.jVal.defaultMessage, cmd.autoHide || false, cmd.styleType || $.fn.jVal.defaultStylye);
						passVal = false;
					}
				} else if ( ( cmd instanceof RegExp && !cmd.test($(this).val()) ) || ( cmd instanceof Function && !cmd($(this).val()) ) ) {
					showWarning(cmd.target || this, $.fn.jVal.defaultMessage);
					passVal = false;
				}
			}
		);
		return passVal;
	};
	$.fn.jValClean = function (target) {
		$(this).find('.jfVal').stop().remove();
		$(target || $(this).find('.jVal,[jVal]')).css({position:'',borderColor:'',left:'0px',top:'0px'}).parent().find('.jValRelWrap').remove();
		return this; // chainable
	};
	$.fn.jVal.init = function () {
		$('.jVal,[jVal]:not(:disabled)').unbind("blur").bind("blur", function (e) {
				$(this).parent().jVal();
			});
		$('.jValKey,[jValKey]').unbind("keypress").bind("keypress", function (e) {
				var cmd = $(this).data('jValKey');
				if ( typeof cmd !== 'object' ) eval( 'cmd = ' + ( $(this).data('jValKey') || $(this).attr('jValKey') ) + ';' );
				var keyTest = valKey( ( (cmd instanceof Object) ? cmd.valid : cmd ), e, (cmd instanceof Object) ? cmd.cFunc : null, (cmd instanceof Object) ? cmd.cArgs : null );
				if ( keyTest == 0 ) {
					$(this).jValClean(cmd.target || this);
					showWarning(cmd.target || this, (( cmd instanceof Object && cmd.message) || $.fn.jVal.defaultKeyMessage).replace('%c', String.fromCharCode(e.keyCode || e.charCode)), true, cmd.styleType || $.fn.jVal.defaultStylye);
					return false;
				} else if ( keyTest == -1 ) return false;
				else $(this).css({borderColor:''}).parent().find('.jfVal').remove();
				return true;
			});
	};
	// automatically init
	$($.fn.jVal.init);
	// setup jVal defaults
	$.fn.jVal.defaultMessage = 'Invalid entry';
	$.fn.jVal.defaultStylye = 'pod';
	$.fn.jVal.defaultKeyMessage = '"%c" Invalid character';
	$.fn.jVal.defaultPadding = 3;
	$.fn.jVal.defaultBorderWidth = 1;
	$.fn.jVal.IETopNudge = $.browser.msie ? -1 : 0;
})(jQuery);