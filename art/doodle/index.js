var myMooFlowPage = {

	start: function(){
	
    var settings = {
			useSlider: false,
			useCaption: true,
			useMouseWheel: true,
			useKeyInput: true,
			useViewer: true,
      reflection: 0.2,
      heightRatio: 0.6,
      offsetY: 70,
			onClickView: function(obj){
				var img  = new Element('img',{src:obj.src, title:obj.title, alt:obj.alt, styles:obj.coords}).setStyles({'position':'absolute','border':'none'});
				var link = new Element('a',{'class':'remooz-element','href':obj.href,'title':obj.title, styles:{'border':'none'}});
				document.body.adopt(link.adopt(img));
				var remooz = new ReMooz(link, {
                cutOut: true,
                centered: true,
                resizeFactor: 0.8,
                origin: link.getElement('img'),
                onClose: function(){
                  $('content').fade('in');
                },
                onCloseEnd: function(){
                  link.destroy()
                },
                onOpenEnd: function(){
                  $('content').fade('out');
                }
		        });
				remooz.open();
			}
    };

		var mf = new MooFlow( $('images'), settings);

		$$('.loadremote').addEvent('click', function(){
			mf.loadHTML(this.get('href'), this.get('rel'));
			return false;
		});

	}
	
};

window.addEvent('domready', myMooFlowPage.start);

