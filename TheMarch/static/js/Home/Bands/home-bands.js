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

//function load_other_menu(result) {    
//    for (var i = 1; i <= 8; i++) {
//        var html = '';
//        var current_array = result.list_band.filter(x => x.band_type === i.toString());
//        if (current_array.length > 0) {
//            html += '<li class=""><a href="#">' + get_band_type(current_array[0].band_type) + '</a><ul class="dropdown">';
//            for (var z = 0; z < current_array.length; z++) {
//                html += '<li><a href="#">' + current_array[z].band_name + '</a></li>';
//            }
//            html += '</ul></li>';
            
//        } else {
//            html += '<li class=""><a href="#">DJ & EDM</a>' +
//                                '<ul class="dropdown">' +
//                                '</ul>' +
//                            '</li>';
//        }
//        $('#bands_menu').append(html);
//    }
//}


function get_band_type(band_type) {
    var band_type_name = ''
    switch (band_type) {
        case '1':
            band_type_name = 'DJ & EDM';
            break;
        case '2':
            band_type_name = 'POP';
            break;
        case '3':
            band_type_name = 'ROCK';
            break;
        case '4':
            band_type_name = 'COUNTRY';
            break;
        case '5':
            band_type_name = 'R&B';
            break;
        case '6':
            band_type_name = 'RAP';
            break;
        case '7':
            band_type_name = 'LATIN';
            break;
        case '8':
            band_type_name = 'KHÁC';
            break;
    }
    return band_type_name;

}

function show_error(message) {
    //swal({
    //    title: "Lỗi!",
    //    text: "Xảy ra lỗi trong quá trình trao đổi dữ liệu!",
    //    type: "warning",
    //    showCancelButton: false,
    //    confirmButtonColor: "#DD6B55",
    //    confirmButtonText: "OK",
    //    closeOnConfirm: false
    //});
}

//html += '<li class=""><a href="#">DJ & EDM</a>' +
//                    '<ul class="dropdown">' +
//                        '<li><a href="#">Avicii</a></li>' +
//                        '<li><a href="#">Deadmau5</a></li>' +
//                        '<li><a href="#">Skrillex  </a></li>' +
//                        '<li><a href="#">David Guetta</a></li>' +
//                        '<li><a href="#">Calvin Harris</a></li>' +
//                        '<li><a href="#">Tiësto</a></li>' +
//                        '<li><a href="mp-index-app-landing.html">Martin Garrix</a> </li>' +
//                        '<li><a href="mp-index-parallax.html">Diplo</a> </li>' +
//                        '<li><a href="mp-index-coming-soon.html">Steve Aoki</a> </li>' +
//                    '</ul>' +
//                '</li>';