$(document).ready(function () {

    $('.summernote').summernote({
        height: 350, // set editor height
        minHeight: null, // set minimum height of editor
        maxHeight: null, // set maximum height of editor
        focus: false // set focus to editable area after initializing summernote
    });

    $('#back_event').on("click", function () {
        window.location.href = '/admin/event';
    })

    $('form').bind('submit', function (e) {
        e.preventDefault();
        var event_type = $('#event_type').val();
        var title = $('#title').val();
        // thumbnail
        var thumbnail = $('#thumbnail')[0].files[0];
        var is_empty_thumbnail = true;
        var thumbnail_file = '';
        if(thumbnail != undefined){
            thumbnail_file = thumbnail;
            is_empty_thumbnail = false
        }
        // thumbnail detail
        var thumbnail_detail = $('#thumbnail_detail')[0].files[0];
        var is_empty_thumbnail_detail = true;
        var thumbnail_file_detail = '';
        if (thumbnail_detail != undefined) {
            thumbnail_file_detail = thumbnail_detail;
            is_empty_thumbnail_detail = false
        }
        var short_description = $('#short_description').val();
        var description = $('.summernote').code();
        //var description = $('.summernote').summernote('code');
        var is_important =$('#is_important').is(":checked");
        if($.trim(event_type) == '' || $.trim(title) == '' || $.trim(short_description) == ''){
            return;
        }
        var data = new FormData();
        data.append('event_type', event_type);
        data.append('title', title);
        data.append('is_empty_thumbnail', is_empty_thumbnail);
        data.append('thumbnail_file', thumbnail_file);
        data.append('is_empty_thumbnail_detail', is_empty_thumbnail_detail);
        data.append('thumbnail_file_detail', thumbnail_file_detail);
        data.append('short_description', short_description);
        data.append('description', description);
        data.append('is_important', is_important);
        $.ajax({
            url: "/add_event_db", //the page containing python script
            type: "POST", //request type,
            data: data,
            cache: false,
            processData: false,
            contentType: false,
            success: function (result) {
                result = jQuery.parseJSON(result);
                if (result.result == 'success') {
                    window.location.href = '/admin/event';
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