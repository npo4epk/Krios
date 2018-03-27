
'use strict';

// SVG Sender
var SVGSender = ( function() {

    'use strict';

    var docElem = window.document.documentElement;

    window.requestAnimFrame = function(){
        return (
            window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(/* function */ callback){
                window.setTimeout(callback, 1000 / 60);
            }
        );
    }();

    window.cancelAnimFrame = function(){
        return (
            window.cancelAnimationFrame       ||
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame    ||
            window.oCancelAnimationFrame      ||
            window.msCancelAnimationFrame     ||
            function(id){
                window.clearTimeout(id);
            }
        );
    }();

    function SVGEl( el ) {
        this.el = el;
        this.image = this.el.previousElementSibling;
        this.current_frame = 0;
        this.total_frames = 60;
        this.path = new Array();
        this.length = new Array();
        this.handle = 0;
        this.init();
    }

    SVGEl.prototype.init = function() {
        var self = this;
        [].slice.call( this.el.querySelectorAll( 'path' ) ).forEach( function( path, i ) {
            self.path[i] = path;
            var l = self.path[i].getTotalLength();
            self.length[i] = l;
            self.path[i].style.strokeDasharray = l + ' ' + l;
            self.path[i].style.strokeDashoffset = l;
        } );
    };

    SVGEl.prototype.render = function() {
        if( this.rendered ) return;
        this.rendered = true;
        this.draw();
    };

    SVGEl.prototype.draw = function() {
        var self = this,
            progress = 0;
        if ( $(window).width() > 992 && $(window).height() > 680 ) {
            progress = this.current_frame/this.total_frames;
        } else {
            progress = this.current_frame/this.total_frames + 0.2;
        }

        if (progress > 1) {
            window.cancelAnimFrame(this.handle);
            this.showImage();
        } else {
            this.current_frame++;
            for(var j=0, len = this.path.length; j<len;j++){
                this.path[j].style.strokeDashoffset = Math.floor(this.length[j] * (1 - progress));
            }
            this.handle = window.requestAnimFrame(function() { self.draw(); });
        }
    };

    SVGEl.prototype.showImage = function() {
        this.image.style.display = 'inline-block';
        this.el.style.display = 'none';
    };

    SVGEl.prototype.hideImage = function() {
        this.image.style.display = 'none';
        this.el.style.display = 'inline-block';
    };

    function getViewportH() {
        var client = docElem['clientHeight'],
            inner = window['innerHeight'];

        if( client < inner )
            return inner;
        else
            return client;
    }

    function scrollY() {
        return window.pageYOffset || docElem.scrollTop;
    }

    function getOffset( el ) {
        var offsetTop = 0, offsetLeft = 0;
        do {
            if ( !isNaN( el.offsetTop ) ) {
                offsetTop += el.offsetTop;
            }
            if ( !isNaN( el.offsetLeft ) ) {
                offsetLeft += el.offsetLeft;
            }
        } while( el = el.offsetParent )

        return {
            top : offsetTop,
            left : offsetLeft
        };
    }

    function inViewport( el, h ) {
        var elH = el.offsetHeight,
            scrolled = scrollY(),
            viewed = scrolled + getViewportH(),
            elTop = getOffset(el).top,
            elBottom = elTop + elH,
            // if 0, the element is considered in the viewport as soon as it enters.
            // if 1, the element is considered in the viewport only when it's fully inside
            // value in percentage (1 >= h >= 0)
            h = h || 0;

        return (elTop + elH * h) <= viewed && (elBottom) >= scrolled;
    }

    function initSVGSender() {
         var svgs = Array.prototype.slice.call( document.querySelectorAll( 'svg' ) ),
             svgArr = new Array(),
             didScroll = false,
             resizeTimeout;

         function renderSVGSender() {
             // the svgs already shown...
             svgs.forEach( function( el, i ) {
                 var svg = new SVGEl( el );
                 svgArr[i] = svg;
                 setTimeout(function( el ) {
                     return function() {
                         if( inViewport( el.parentNode ) ) {
                             svg.render();
                         }
                     };
                 }( el ), 250 );
             } );
         }
         function scrollHandler() {
             if( !didScroll ) {
                 didScroll = true;
                 setTimeout( function() { scrollPage(); }, 60 );
             }
         };
         function scrollPage() {
             svgs.forEach( function( el, i ) {
                 if( inViewport( el.parentNode, 0.5 ) ) {
                     svgArr[i].hideImage();
                     svgArr[i].render();
                 }
             });
             didScroll = false;
         };
         function resizeHandler() {
             function delayed() {
                 scrollPage();
                 resizeTimeout = null;
             }
             if ( resizeTimeout ) {
                 clearTimeout( resizeTimeout );
             }
             resizeTimeout = setTimeout( delayed, 200 );
         };

         return {
             renderSVGSender : renderSVGSender(),
             scrollHandler : scrollHandler()
         }
     };

    return {
        init: function () {
            initSVGSender().renderSVGSender;
        },
        scroll: function () {
            initSVGSender().scrollHandler;
        }
    };

} )();

// Map Yandex
var MapYandex = (function () {

    var $mapYandex = undefined,
        $mapYandexPlacemark = undefined;

    function __initMap() {
        var $map = $('#map');
        if($map.length) {
            $mapYandex = new ymaps.Map("map", {
                center: [53.911533, 27.454577],
                zoom: 16,
                controls: []
            });
            $mapYandexPlacemark = new ymaps.Placemark($mapYandex.getCenter(), {
                hintContent: "Krios Group",
                balloonContent: "Krios Group"
            }, {
                iconLayout: "default#image",
                iconImageHref: "img/icon-map.png",
                iconImageSize: [30, 46]
            });
            $mapYandex.behaviors.disable("scrollZoom");
            // $mapYandex.behaviors.disable("drag");
            $mapYandex.geoObjects.add($mapYandexPlacemark);

            __resizeMap();
        }
    };

    function __resizeMap() {
        var $map = $('#map'),
            $formBlock = $('.form-block'),
            $formBlockHeight= $formBlock.innerHeight(),
            $contacts = $('.contacts'),
            $contactsWidth = $contacts.innerWidth();

        if($map.length) {
            $map.css('width', $contactsWidth / 2 + 'px');
            if ( window.innerWidth < 992 || window.innerHeight < 680 ) {
                $map.css('height', $formBlockHeight + 'px');
            } else {
                $map.css('height', '100%');
            }
            $mapYandex.container.fitToViewport();
        }
    };

    return {
        init : function () {
            __initMap();
        },
        resize: function () {
            __resizeMap();
        }
    };
    
}());

// Fullpage
var Fullpage = (function () {

    function __initFullpage() {
        var $fullpage = $('#fullpage');
        $fullpage.fullpage({
            //Navigation
            anchors: ['welcome', 'about', 'services', 'model', 'portfolio', 'contacts'],
            //Scrolling
            css3: false,
            scrollBar: false,
            scrollingSpeed: 1000,
            //Design
            verticalCentered: false,
            navigation: true,
            navigationPosition: 'right',
            controlArrows: false,
            responsiveWidth: 992,
            responsiveHeight: 680,
            //Custom selectors
            sectionSelector: '.welcome, .about, .services, .model, .portfolio, .contacts',
            //Events
            afterLoad: function () {
                if (window.innerWidth > 997 && window.innerHeight > 680) {
                    SVGSender.scroll();
                };
            },
        });
    };

    function __destroyFullpage(param) {
        $.fn.fullpage.setAllowScrolling(param);
        $.fn.fullpage.setKeyboardScrolling(param);
    };

    return {
        init : function () {
            __initFullpage();
        },
        destroy : function (param) {
            __destroyFullpage(param);
        }
    };

}());

// Text 
var Text = (function () {

    function _initText() {
        if (window.innerWidth <= 900) {
            var $titleText = $('.title__text'),
                $titleTextHtml = $titleText.html();

            $titleText.html($titleTextHtml.replace('<br>',''));
        }
    };

    return {
        init : function () {
            _initText();
        }
    };

}());

// Preloader
var Preloader = (function () {

    function __initPreloader() {

        var $body = $('body'),
            $preloader = $('#preloader'),
            $pageVue = $('#page-vue');

        $preloader.delay(100)
                  .fadeOut('slow');

        $pageVue.delay(100)
                .fadeTo(500, 1, function(){
                    $body.removeClass('body-hidden');
                });

    };

    return {
        init : function () {
            __initPreloader();
        }
    };

}());

// ready
$(document).ready(function() {

    var $language = (navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0,2);

    Vue.component('modalWindow', {
        template: '' +
        '<transition name="modal">' +
        '   <div class="modal-container" v-if="data">' +
        '       <div class="modal-container__background background" v-bind:style="{backgroundImage: \'url(\'+\'img/portfolio/preview/\' + data.image + \'.jpg\'+\')\'}">' +
        '           <img v-bind:class="{\'background__img\' : true, \'background__img--top\' : data.image == \'prabook\' || data.image == \'marketParser\'}" v-bind:src="\'img/portfolio/preview/\' + data.image + \'-logo\'+\'.png\'">' +
        '       </div>' +
        '       <div class="modal-container__info-description info-description">' +
        '           <div class="info-description__name name">' +
        '               <p class="name__text">{{data.name}}</p>' +
        '           </div>' +
        '           <div class="info-description__table table">' +
        '               <div class="table__short short">' +
        '                   <div class="short__industry industry">' +
        '                       <p class="industry__title">{{data.industry.title}}</p>' +
        '                       <p class="industry__text">{{data.industry.text}}</p>' +
        '                   </div>' +
        '                   <div class="short__market market">' +
        '                       <p class="market__title">{{data.market.title}}</p>' +
        '                       <p class="market__text">{{data.market.text}}</p>' +
        '                   </div>' +
        '                   <div class="short__period-of-development period-of-development">' +
        '                       <p class="period-of-development__title">{{data.periodOfDevelopment.title}}</p>' +
        '                       <p class="period-of-development__text">{{data.periodOfDevelopment.text}}</p>' +
        '                   </div>' +
        '                   <div class="short__ustomer-location customer-location">' +
        '                       <p class="customer-location__title">{{data.customerLocation.title}}</p>' +
        '                       <p class="customer-location__text">{{data.customerLocation.text}}</p>' +
        '                   </div>' +
        '               </div>' +
        '               <div class="table__more more">' +
        '                   <div class="more__team-members team-members">' +
        '                       <p class="team-members__title">{{data.teamMembers.title}}</p>' +
        '                       <p class="team-members__text">{{data.teamMembers.text}}</p>' +
        '                   </div>' +
        '                   <div class="more__stack-of-technologies stack-of-technologies">' +
        '                       <p class="stack-of-technologies__title">{{data.stackOfTechnologies.title}}</p>' +
        '                       <p class="stack-of-technologies__text">{{data.stackOfTechnologies.text}}</p>' +
        '                   </div>' +
        '               </div>' +
        '           </div>' +
        '           <div class="info-description__contribution contribution">' +
        '               <p class="contribution__title">{{data.teamsContribution.title}}</p>' +
        '               <p class="contribution__text">{{data.teamsContribution.text}}</p>' +
        '           </div>' +
        '           <div class="info-description__project-description project-description">' +
        '               <p class="project-description__title">{{data.projectDescription.title}}</p>' +
        '               <p class="project-description__text">{{data.projectDescription.text}}</p>' +
        '           </div>' +
        '           <div class="info-description__technical technical">' +
        '               <p class="technical__title">{{data.technicalChallenges.title}}</p>' +
        '               <p class="technical__text">{{data.technicalChallenges.text}}</p>' +
        '           </div>' +
        '       </div>' +
        '       <div class="modal-container__control control">' +
    '               <button class="control__btn" @click="$emit(\'close\')"><i class="fas fa-times"></i></button>' +
        '       </div>' +
        '   </div>' +
        '</transition>',
        props: ['data']
    });
    
    new Vue({
        el: '#page-vue',
        data: {
            dataModal: '',
            showModal: false,
            data: '',
            dataPage: '',
            language: $language,
            answerText: ''
        },
        mounted: function() {
            var $self = this;
            $.getJSON("../data/page.json")
                .success(function (data) {
                    $self.data = data;
                    $self.dataPage = $self.data[$self.language];
                });
        },
        methods: {
            translate: function () {
                var $self = this,
                    $formCallback = $('#form-callback'),
                    $answer = $('#answer');
                
                $self.language = $self.language === "en" ? "ru" : "en";
                $self.dataPage = $self.data[$self.language];
                
                if($self.answerText) {
                    $self.answerText = '';
                    $formCallback.show('slow')
                                 .trigger('reset');
                    $answer.hide('hide');
                }
            },
            submitForm: function ($event) {
                var $self = this,
                    $form = $($event.target),
                    $data = $form.serialize(),
                    $url = '/send-message',
                    $type = 'POST',
                    $address = $('#address'),
                    $addressHeight = $address.outerHeight(),
                    $answer = $('#answer');

                $($form).hide('hide');

                $.ajax({
                    data: $data,
                    url: $url,
                    type: $type
                }).done( function (answer) {
                    $answer.height($addressHeight)
                           .show('slow');
                    $self.answerText = $self.dataPage.contacts.answer.done;
                }).fail( function () {
                    $answer.height($addressHeight)
                           .show('slow');
                    $self.answerText = $self.dataPage.contacts.answer.fail;
                });
            },
            modalOpen: function (param) {
                var $self = this,
                    $url = "../data/" + param + ".json";

                $self.showModal = true;
                Fullpage.destroy(false);

                $.getJSON($url)
                    .success(function(data) {
                        $self.dataModal = data;
                    });

            },
            modalClose: function () {
                var $self = this;
                $self.showModal = false;
                Fullpage.destroy(true);
            },
            classItem: function (id) {
                var $classItemName = 'form-callback__item',
                    $$classItemNameIcon = $classItemName + '--' + id,
                    $object = {};

                $object[$classItemName] = true;
                $object[$$classItemNameIcon] = true;

                return $object;
            },
            modalEscapeEvent: function(event) {
                if (event.keyCode === 27 && this.showModal) {
                    this.modalClose();
                }
            }
        },
        created: function() {
            document.addEventListener('keyup', this.modalEscapeEvent);
        },
        destroyed: function() {
            document.removeEventListener('keyup', this.modalEscapeEvent);
        },
        watch: {
            showModal: function(value) {
                var className = 'body-hidden';
                value ? document.body.classList.add(className) : document.body.classList.remove(className);
            }
        }
    });

});

// load
$(window).on('load', function() {

    Fullpage.init();
    Preloader.init();
    Text.init();

    if (window.innerWidth <= 997 || window.innerHeight < 680) {
        $('.video__file').remove();
        $('.item__img').each(function(indx, element){
            $(element).css("display", "inline-block").next('svg').remove();
        });
    } else {
        SVGSender.init();
    };

    ymaps.ready(function(){
        MapYandex.init();
    });
    
});

// resize
$(window).on("resize", function(event) {

    MapYandex.resize();
    Text.init();

});

// orientationchange
$(window).on("orientationchange", function (event) {

    MapYandex.resize();
    Text.init();

});