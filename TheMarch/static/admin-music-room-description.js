$(document).ready(function () {

    // Load description of event
    var data = new FormData();
    data.append('event_id', $('#event_id').val());
    
    //Update event
    $('form').bind('submit', function (e) {
        e.preventDefault();
        var room_id = $('#room_id').val();        
        var room_description = $('#short_description').val();
        var price = $('#price').val();
        var option_1 = $('#option_1').val();
        var option_2 = $('#option_2').val();
        var option_3 = $('#option_3').val();
        var option_4 = $('#option_4').val();
        var option_5 = $('#option_5').val();
        var option_6 = $('#option_6').val();
        var option_7 = $('#option_7').val();
        var option_8 = $('#option_8').val();
        var option_9 = $('#option_9').val();
        var option_10 = $('#option_10').val();

        if ($.trim(room_description) == '') {
            return;
        }
        var data = new FormData();
        data.append('room_id', room_id);
        data.append('room_description', room_description);
        data.append('price', price);
        data.append('option_1', option_1);
        data.append('option_2', option_2);
        data.append('option_3', option_3);
        data.append('option_4', option_4);
        data.append('option_5', option_5);
        data.append('option_6', option_6);
        data.append('option_7', option_7);
        data.append('option_8', option_8);
        data.append('option_9', option_9);
        data.append('option_10', option_10);
        $.ajax({
            url: "/update_room_description", //the page containing python script
            type: "POST", //request type,
            data: data,
            cache: false,
            processData: false,
            contentType: false,
            success: function (result) {
                result = jQuery.parseJSON(result);
                if (result.result == 'success') {
                    show_alert('Lưu thành công!')
                }
                else {
                    show_warning('Xảy ra lỗi trong quá trình trao đổi dữ liệu');
                }
            },
            error: function () {
                show_warning('Xảy ra lỗi trong quá trình trao đổi dữ liệu');
            },
        });
        
    });

});