$(document).ready(function () {

    // Load description of event
    var data = new FormData();
    data.append('event_id_1', $('#event_id_1').val());
    data.append('event_id_2', $('#event_id_2').val());
    $.ajax({
        url: "/home/list_event_slider", //the page containing python script
        type: "POST", //request type,
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function (result) {
            result = jQuery.parseJSON(result);
            if (result.result == 'success') {
                if (result.list_event_slider.length <= 2) {
                    $('#content-slider').hide();
                } else {
                    var html = '';
                    for (var i = 0; i < result.list_event_slider.length; i = i+2 ) {
                        if (i == 0) {
                            html += '<div class="item active">';
                        }
                        else {
                            html += '<div class="item">';
                        }
                        html +=     '<div class="row">' +
                                        '<div class="col-md-6">' +
                                            '<div class="attraction-link">' +
                                                '<a href="http://www.tablemountain.net/" target="_blank">' +
                                                    '<div class="attraction-img">' +
                                                        '<img class="img-responsive img-slider" src="' + result.list_event_slider[i].thumbnail + '" alt="" />' +
                                                        '<div class="attraction-overlay">' +
                                                            '<i class="icon-link"></i>' +
                                                        '</div>' +
                                                    '</div>' +
                                                    '<div class="attraction-caption">' +
                                                        '<div class="attraction-caption-title">' + result.list_event_slider[i].event_type + '</div>' +
                                                        '<div class="attraction-distance">' + result.list_event_slider[i].created_date + '</div>' +
                                                    '</div>' +
                                                '</a>' +
                                            '</div>' +
                                        '</div>' +
                                    '<div class="col-md-6">' +
                                            '<div class="attraction-link">' +
                                                '<a href="http://www.tablemountain.net/" target="_blank">' +
                                                    '<div class="attraction-img">' +
                                                        '<img class="img-responsive img-slider" src="' + result.list_event_slider[i + 1].thumbnail + '" alt="" />' +
                                                        '<div class="attraction-overlay">' +
                                                            '<i class="icon-link"></i>' +
                                                        '</div>' +
                                                    '</div>' +
                                                    '<div class="attraction-caption">' +
                                                        '<div class="attraction-caption-title">' + result.list_event_slider[i + 1].event_type + '</div>' +
                                                        '<div class="attraction-distance">' + result.list_event_slider[i + 1].created_date + '</div>' +
                                                    '</div>' +
                                                '</a>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                            '</div>';
                    }
                    $('#content-slider-inner').html(html);
                }
            }
            else {
                show_error('');
            }
        },
        error: function () {
            show_error('');
        },
    });
});

function show_error(message) {
 
}