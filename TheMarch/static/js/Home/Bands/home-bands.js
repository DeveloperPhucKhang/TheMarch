$(document).ready(function () {
    //Load menu
    $.ajax({
        url: "/home/load_home_band_detail_data", //the page containing python script
        type: "POST", //request type,
        cache: false,
        processData: false,
        contentType: false,
        success: function (result) {
            result = jQuery.parseJSON(result);
            if (result.result == 'success') {
                load_menu_all(result);
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
function load_menu_all(result) {
    //Show data in menu all
    var html = '';
    if (result.list_band.length <= 7) {
        html = '<div class="col3">' +
                    '<ul class="list-unstyled">';
        for (var i = 0; i < result.list_band.length; i++) {
            html += '<li><a href="/home/home_band_detail/' + result.list_band[i]._id + '">' + result.list_band[i].band_name + '</a></li>';
        }
        html += '</ul></div>';

    } else {
        var count = 0;
        for (var i = 0; i < result.list_band.length; i = i + 7) {
            count = i;
            html += '<div class="col3"><ul class="list-unstyled">';
            for (var z = 0; z < 7; z++) {
                if (count < result.list_band.length) {
                    html += '<li><a href="/home/home_band_detail/' + result.list_band[count]._id + '">' + result.list_band[count].band_name + '</a></li>';
                }
                count = count + 1;
            }
            html += '</ul></div>';
        }
    }
    $('#all_menu').html(html);
}

function show_error(message) {
 
}
