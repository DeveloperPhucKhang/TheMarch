$(document).ready(function () {

    $('.summernote').summernote({
        height: 350, // set editor height
        minHeight: null, // set minimum height of editor
        maxHeight: null, // set maximum height of editor
        focus: false // set focus to editable area after initializing summernote
    });

    $('#back_event').on("click", function () {
        window.location.href = '/admin/band_detail';
    })

    // Load description of event
    var data = new FormData();
    data.append('band_id', $('#band_id').val());
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
                $('.summernote').code(result.description.description);
                $('#band_type').val(result.band_type.band_type);
            }
            else {
                show_error('');
            }
        },
        error: function () {
            show_error('');
        },
    });

    //Update event
    $('form').bind('submit', function (e) {
        e.preventDefault();
        var band_id = $('#band_id').val();
        var band_name = $('#band_name').val();
        var band_type = $('#band_type').val();
        var title = $('#title').val();
        var old_thumbnail = $('#old_thumbnail').attr('value');
        var thumbnail = $('#thumbnail')[0].files[0];
        var old_thumbnail_detail = $('#old_thumbnail_detail').attr('value');
        var thumbnail_detail = $('#thumbnail_detail')[0].files[0];
        var is_empty_thumbnail = true;
        var is_empty_thumbnail_detail = true;
        var thumbnail_file = '';
        var thumbnail_file_detail = '';
        if(thumbnail != undefined){
            thumbnail_file = thumbnail;
            is_empty_thumbnail = false
        }
        if (thumbnail_detail != undefined) {
            thumbnail_file_detail = thumbnail_detail;
            is_empty_thumbnail_detail = false
        }
        var short_description = $('#short_description').val();
        var is_approve = $('#cbk_approve').attr('value');
        var description = $('.summernote').code();
        var score = $('#score').val();
        //var is_important =$('#is_important').is(":checked");
        if ($.trim(band_name) == '' || $.trim(title) == '' || $.trim(short_description) == '') {
            return;
        }
        var data = new FormData();
        data.append('band_id', band_id);
        data.append('band_name', band_name);
        data.append('band_type', band_type);
        data.append('title', title);
        data.append('old_thumbnail', old_thumbnail);
        data.append('is_empty_thumbnail', is_empty_thumbnail);
        data.append('thumbnail_file', thumbnail_file);
        data.append('old_thumbnail_detail', old_thumbnail_detail);
        data.append('is_empty_thumbnail_detail', is_empty_thumbnail_detail);
        data.append('thumbnail_file_detail', thumbnail_file_detail);
        data.append('short_description', short_description);
        data.append('description', description);
        data.append('is_important', true);
        data.append('is_approve', is_approve);
        data.append('score', score);
        $.ajax({
            url: "/update_band_detail_db", //the page containing python script
            type: "POST", //request type,
            data: data,
            cache: false,
            processData: false,
            contentType: false,
            success: function (result) {
                result = jQuery.parseJSON(result);
                if (result.result == 'success') {
                    window.location.href = '/admin/band_detail';
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

});

function clear() {


}

function show_error(current_input) {
    swal({
        title: "Lỗi!",
        text: "Xảy ra lỗi trong quá trình trao đổi dữ liệu!",
        type: "warning",
        showCancelButton: false,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "OK",
        closeOnConfirm: false
    });
}

var current_approve;
function approve_band_detail(flag) {
    current_approve = flag;
    if (current_approve == false) {
        button_html = '<button aria-expanded="false" data-toggle="dropdown" class="btn btn-danger dropdown-toggle waves-effect waves-light" type="button">' +
                        'Chưa xét duyệt <span class="caret"></span>' +
                        '</button>' +
                        '<ul role="menu" class="dropdown-menu animated flipInX">' +
                        '<li><a href="#" id="cbk_approve" value="false" onclick="approve_event(true)" >Xét duyệt</a></li>' +
                        '</ul>';
    }
    else {
        button_html = '<button aria-expanded="false" data-toggle="dropdown" class="btn btn-info dropdown-toggle waves-effect waves-light" type="button">' +
                        '<i class="ti-arrow-circle-down"></i> Đã xét duyệt <span class="caret"></span>' +
                        '</button>' +
                        '<ul role="menu" class="dropdown-menu animated flipInX">' +
                        '<li><a href="#" id="cbk_approve" value="true" onclick="approve_event(false)" >Chưa xét duyệt</a></li>' +
                        '</ul>';
    }
    $('#btn_approve').html(button_html);
    //var band_id = $('#band_id').val();
    //var data = new FormData();
    //data.append('band_id', band_id);
    //data.append('is_approve', flag);
    //$.ajax({
    //    url: "/approve_band_detail", //the page containing python script
    //    type: "POST", //request type,
    //    data: data,
    //    cache: false,
    //    processData: false,
    //    contentType: false,
    //    success: function (result) {
    //        result = jQuery.parseJSON(result);
    //        if (result.result == 'success') {
    //            show_alert('Lưu thành công!');
    //            var button_html;
    //            if (current_approve == false) {
    //                button_html = '<button aria-expanded="false" data-toggle="dropdown" class="btn btn-danger dropdown-toggle waves-effect waves-light" type="button">' +
    //                                'Chưa xét duyệt <span class="caret"></span>' +
    //                                '</button>' +
    //                                '<ul role="menu" class="dropdown-menu animated flipInX">' +
    //                                '<li><a href="#" onclick="approve_event(true)" >Xét duyệt</a></li>' +
    //                                '</ul>';
    //            }
    //            else {
    //                button_html = '<button aria-expanded="false" data-toggle="dropdown" class="btn btn-info dropdown-toggle waves-effect waves-light" type="button">' +
    //                                '<i class="ti-arrow-circle-down"></i> Đã xét duyệt <span class="caret"></span>' +
    //                                '</button>' +
    //                                '<ul role="menu" class="dropdown-menu animated flipInX">' +
    //                                '<li><a href="#" onclick="approve_event(false)" >Chưa xét duyệt</a></li>' +
    //                                '</ul>';
    //            }
    //            $('#btn_approve').html(button_html);
    //        }
    //        else {
    //            show_error('');
    //        }
    //    },
    //    error: function () {
    //        show_error('');
    //    },
    //});
}