(function($) {

    "use strict";

    $('#element').toggle();

    // Location Address
    //-------------------------------------------------------------------------------
    var companyName = 'March Live Music';
    var address = '247A/6 Huỳnh Văn, p12, phú nhuận, Hồ Chí Minh '; // Enter your Address


    // Navigation Close on Click
    //-------------------------------------------------------------------------------
    $(document).ready(function () {
        $(".navbar-nav li a").on('click', function(event) {
            $(".navbar-collapse").collapse('hide');
        });
    });


    // Initialize Tooltip and Placeholder
    //-------------------------------------------------------------------------------
    $('.my-tooltip').tooltip();
    $('input, textarea').placeholder();


    // Initialize Date Picker
    //-------------------------------------------------------------------------------
    $('.datepicker').datepicker({
        todayHighlight: true,
        startDate: new Date()
    }).on('changeDate', function () {
        $(this).datepicker('hide');
    });


    // Scroll To Animation
    //-------------------------------------------------------------------------------
    $('body').scrollspy({target: '#navigation-top', offset: 100});

    var scrollTo = $(".scroll-to");

    scrollTo.on('click', function (event) {
        $('.modal').modal('hide');
        var position = $(document).scrollTop();
        var scrollOffset = 0; //Hoang edit scrollOffset value from 100 to 0 - 20/06/2018

        var marker = $(this).attr('href');
        $('html, body').animate({scrollTop: $(marker).offset().top - scrollOffset}, 'slow');
        return false;
    });


    // Scroll Up Btn
    //-------------------------------------------------------------------------------
    $(window).scroll(function(){
        if ($(this).scrollTop() > 100) {
            $('.scroll-up-btn').removeClass("animated fadeOutRight");
            $('.scroll-up-btn').fadeIn().addClass("animated fadeInRight");
        } else {
            $('.scroll-up-btn').removeClass("animated fadeInRight");
            $('.scroll-up-btn').fadeOut().addClass("animated fadeOutRight");
        }
    });



    // Parallax Scrolling
    //-------------------------------------------------------------
    var $w = $(window);
    var reviews = $('.reviews');

    function move($c) {
        var offset = $c.offset().top;
        var scroll = $w.scrollTop();
        var diff = offset - scroll;
        var pos = 'center ' + (-diff)*0.2 + 'px';
        $c.css({'backgroundPosition':pos});
    }

    //Hoang comment waypoint function - 20/06/2018
    // reviews.waypoint(function() {
    //     $w.bind('scroll', function(e){
    //         move(reviews);
    //     });
    //
    // },{
    //     offset: '100%'
    // });




    // Room Tabs
    //-------------------------------------------------------------------------------

    // Thumbnails
    $('.room-tabs-gallery').on('click', '.room-tabs-gallery-thumb', function(){
        var tabId = $(this).attr('href');
        var newImgSrc = $(this).find('img').attr('src');
        var imgTitle = $(this).find('img').attr('title');

        $(tabId + " .room-tabs-gallery-preview").fadeOut(100, function() {
            $(tabId + " .room-tabs-gallery-preview").attr("src", newImgSrc);
            $(tabId + " .room-tabs-gallery-preview").attr("title", imgTitle);
        }).fadeIn(100);

        return false;
    });

    // Preview Modal
    $(".room-tabs-gallery-preview-container").on("click", function () {

        //var src = $(this).find("img").data('img');
        var src = $(this).find("img").attr('src');
        var previewImg = $('<img/>').attr('src', src).addClass('img-responsive');

        var previewImgWidth;
        previewImg.load(function () {
            previewImgWidth = this.width;
        });

        var imgTitle = $(this).find('img').attr('title');

        $('#roomTabsGalleryPreviewModal').modal();
        $('#roomTabsGalleryPreviewModal').on('shown.bs.modal', function () {
            $('#roomTabsGalleryPreviewModal .modal-dialog').css('max-width', previewImgWidth);
            $('#roomTabsGalleryPreviewModal .modal-body').html(previewImg);
            $('#roomTabsGalleryPreviewModal .modal-nav .title').html(imgTitle);
        });
        $('#roomTabsGalleryPreviewModal').on('hidden.bs.modal', function () {
            $('#roomTabsGalleryPreviewModal .modal-body').html('');
        });

        return false;
    });


    // Attractions Video
    //-------------------------------------------------------------------------------

    $('.attractions').on('click', '.video-preview-img', function(){

        var videoSrc = $('.video iframe').attr('src');

        $(".video iframe").load(function(){
            $('.video-preview-img').fadeOut(300, function(){
                $('.attractions .video').css('visibility','visible').hide().fadeIn(300).removeClass('hidden');
            });
        }).attr('src', videoSrc+'&autoplay=1');

    });


    // Counter
    //-------------------------------------------------------------------------------
    $('.counter').waypoint(function() {

        $('.counter-number').each(function(){
            var numberValue = $(this).data('value');
            $(this).animateNumber({number:numberValue}, 5000);
        });

        this.destroy()

    }, {
        offset: '100%',
        triggerOnce: true
    });


    // Rates
    //-------------------------------------------------------------------------------
    $('.rate-box').on('mouseover', function(){
        $('.rate-box').removeClass('highlight', {duration:500});
        $(this).addClass('highlight', {duration:500});
    });


    // Scroll Animation
    //-------------------------------------------------------------------------------
    $('.sc-animate').waypoint(function() {
        var effect = $(this.element).data('effect');
        $(this.element).css('visibility', 'visible');
        $(this.element).addClass('animated');
        $(this.element).addClass(effect);

        this.destroy()

    }, {
        offset: '87%',
        triggerOnce: true
    });




    // Load Contact Gmap
    //-------------------------------------------------------------------------------

    var geocoder;
    var map;

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var draggable = w > 992 ? true : false; // Disable on Mobile


    geocoder = new google.maps.Geocoder();

    var icon = {
        url: "/static/FrontEnd/img/ico/apple-touch-icon-114-precomposed.png", // url
        scaledSize: new google.maps.Size(50, 50), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(20, 35) // anchor
    };

    var mapOptions = {
        zoom: 19,
        scrollwheel: false,
        draggable: draggable,
        mapTypeControl: false,
        center: new google.maps.LatLng(0, 0),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    map = new google.maps.Map(document.getElementById('location-map'), mapOptions);

    var contentString = '<div id="content">' +
        '<strong>' + companyName + '</strong><br>' +
        'Address: 51 Trần Quang Diệu, Phường 13, Quận 3, Hồ Chí Minh ' +
        '</div>';

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });

    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
                //icon: '/static/FrontEnd/img/ico/apple-touch-icon-114-precomposed.png',
                icon: icon,
                title: companyName
            });

            google.maps.event.addListener(marker, 'click', function () {
                infowindow.open(map, marker);
            });

        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });



    // Show Inquiry Modal
    //-------------------------------------------------------------------------------
    $('.show-inquiry-modal').on('click', function () {
        var object = $(this).data('object');
        if (object) {
            $("#inquiry-object").val(object);
        }
        $('#inquiryModal').modal('show');
        return false;
    });



    // Contact Form
    //-------------------------------------------------------------

    $("#contact-form").submit(function () {

        var contactFormMsg = $('#contact-form-msg');
        contactFormMsg.addClass('hidden');
        contactFormMsg.removeClass('alert-success');
        contactFormMsg.removeClass('alert-danger');

        $('#contact-form .btn-contact-submit').attr('disabled', 'disabled');

        $.ajax({
            type: "POST",
            url: "php/index.php",
            data: $("#contact-form").serialize(),
            dataType: "json",
            success: function (data) {

                if ('success' == data.result) {
                    contactFormMsg.css('visibility', 'visible').hide().fadeIn().removeClass('hidden').addClass('alert-success');
                    contactFormMsg.html(data.msg[0]);
                    $('#contact-form .btn-contact-submit').removeAttr('disabled');
                    $('#contact-form')[0].reset();
                }

                if ('error' == data.result) {
                    contactFormMsg.css('visibility', 'visible').hide().fadeIn().removeClass('hidden').addClass('alert-danger');
                    contactFormMsg.html(data.msg[0]);
                    $('#contact-form .btn-contact-submit').removeAttr('disabled');
                }

            }
        });

        return false;
    });


    // Inquiry Form
    //-------------------------------------------------------------

    $("#inquiry-form").submit(function () {

        var inquiryFromMsg = $('#inquiry-form-msg');
        inquiryFromMsg.addClass('hidden');
        inquiryFromMsg.removeClass('alert-success');
        inquiryFromMsg.removeClass('alert-danger');

        $('#inquiry-form .btn-inquiry-submit').attr('disabled', 'disabled');

        $.ajax({
            type: "POST",
            url: "php/index.php",
            data: $("#inquiry-form").serialize(),
            dataType: "json",
            success: function (data) {

                if ('success' == data.result) {
                    inquiryFromMsg.css('visibility', 'visible').hide().fadeIn().removeClass('hidden').addClass('alert-success');
                    inquiryFromMsg.html(data.msg[0]);
                    $('#inquiry-form .btn-inquiry-submit').removeAttr('disabled');
                    $('#inquiry-form')[0].reset();

                    setTimeout(function(){
                        inquiryFromMsg.addClass('hidden');
                        $('#inquiryModal').modal('hide');
                    }, 7000);
                }

                if ('error' == data.result) {
                    inquiryFromMsg.css('visibility', 'visible').hide().fadeIn().removeClass('hidden').addClass('alert-danger');
                    inquiryFromMsg.html(data.msg[0]);
                    $('#inquiry-form .btn-inquiry-submit').removeAttr('disabled');
                }

            }
        });

        return false;
    });


    // Newsletter Form
    //-------------------------------------------------------------------------------

    $( "#newsletter-form" ).submit(function() {

        var newsletterFormMsg = $('#newsletter-form-msg');
        newsletterFormMsg.addClass('hidden');
        newsletterFormMsg.removeClass('alert-success');
        newsletterFormMsg.removeClass('alert-danger');

        $('#newsletter-form input[type=submit]').attr('disabled', 'disabled');

        $.ajax({
            type: "POST",
            url: "php/index.php",
            data: $("#newsletter-form").serialize(),
            dataType: "json",
            success: function(data) {

                if('success' == data.result)
                {
                    newsletterFormMsg.css('visibility','visible').hide().fadeIn().removeClass('hidden').addClass('alert-success');
                    newsletterFormMsg.html(data.msg[0]);
                    $('#newsletter-form input[type=submit]').removeAttr('disabled');
                    $('#newsletter-form')[0].reset();
                }

                if('error' == data.result)
                {
                    newsletterFormMsg.css('visibility','visible').hide().fadeIn().removeClass('hidden').addClass('alert-danger');
                    newsletterFormMsg.html(data.msg);
                    $('#newsletter-form input[type=submit]').removeAttr('disabled');
                }

            }
        });

        return false;
    });


})(jQuery);
