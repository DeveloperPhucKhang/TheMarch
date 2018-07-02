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
});