$(document).ready(function () {

    // Load description of event
    var data = new FormData();
    data.append('band_id', $('#band_detail_id').val());
    $.ajax({
        url: "/load_band_detail_description", //the page containing python script
        type: "POST", //request type,
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function (result) {
            result = jQuery.parseJSON(result);
            if (result.result == 'success') {
                $('#content_detail').html(result.description.description);
            }
            else {
                show_error('');
            }
        },
        error: function () {
            show_error('');
        },
    });

    var data = new FormData();
    data.append('band_id', $('#band_detail_id').val());
    data.append('band_category', $('#band_category').val());
    // Load list event recently
    $.ajax({
        url: "/home/list_band_by_type", //the page containing python script
        type: "POST", //request type,
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function (result) {
            result = jQuery.parseJSON(result);
            if (result.result == 'success') {
                if (result.list_band.length > 0) {
                    $('#box_same_band').show();
                }
                var html = '';
                for (var i = 0; i < result.list_band.length; i++) {
                    html += '<li>'+
                                '<div class="thumb"><a href="/home/home_band_detail/' + result.list_band[i]._id + '"><img style="height: 60px;object-fit: cover;" src="' + result.list_band[i].thumbnail + '" alt="" /></a></div>' +
                                '<div class="w-desk">'+
                                    '<a href="/home/home_band_detail/' + result.list_band[i]._id + '">' + result.list_band[i].band_name + '</a>' +                                     
                            '</li>';
                }
                $('#list_same_band').html(html);
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