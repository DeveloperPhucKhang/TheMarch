$(document).ready(function () {

    // Load description of event
    var data = new FormData();
    data.append('event_id', $('#event_id').val());
    $.ajax({
        url: "/load_event_description", //the page containing python script
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
    data.append('event_id', $('#event_id').val());
    // Load list event recently
    $.ajax({
        url: "/home/list_event_recently", //the page containing python script
        type: "POST", //request type,
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function (result) {
            result = jQuery.parseJSON(result);
            if (result.result == 'success') {
                var html = '';
                for (var i = 0; i < result.list_event_recently.length; i++) {
                    html += '<li>' +
                                '<div class="thumb"><a href="/home/detail_event/' + result.list_event_recently[i]._id + '"><img style="max-height: 70px;object-fit: cover;" src="/' + result.list_event_recently[i].thumbnail + '" alt="' + result.list_event_recently[i].title + '"/></a></div>' +
                                '<div class="w-desk">' +
                                    '<a href="/home/detail_event/' + result.list_event_recently[i]._id + '">' + result.list_event_recently[i].event_type + '</a>' +
                                    '' + result.list_event_recently[i].created_date + ''
                                    '</div>' +
                            '</li>';
                }
                $('#list_event_recently').html(html);
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