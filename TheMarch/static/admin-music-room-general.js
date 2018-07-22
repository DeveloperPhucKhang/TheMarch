$(document).ready(function () {

    $('form').bind('submit', function (e) {
        e.preventDefault();
        var general_id = $('#general_id').val();
        var description_1 = $('#description_1').val();
        var description_2 = $('#description_2').val();

        if ($.trim(description_1) == '') {
            return;
        }
        if ($.trim(description_2) == '') {
            return;
        }

        var data = new FormData();
        data.append('general_id', general_id);
        data.append('description_1', description_1);
        data.append('description_2', description_2);
        $.ajax({
            url: "/update_room_general", //the page containing python script
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