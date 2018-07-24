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
                    for (var i = 0; i < result.list_event_slider.length; i = i + 2) {
                        if (i == 0) {
                            html += '<div class="item active">';
                        }
                        else {
                            html += '<div class="item">';
                        }
                        html += '<div class="row">' +
                                        '<div class="col-md-6">' +
                                            '<div class="attraction-link">' +
                                                '<a href="/home/detail_event/' + result.list_event_slider[i]._id + '" target="_blank">' +
                                                    '<div class="attraction-img">' +
                                                        '<img style="object-fit: cover;max-height:200px" class="img-responsive img-slider" src="' + result.list_event_slider[i].thumbnail + '" alt="" />' +
                                                        '<div class="attraction-overlay">' +
                                                            '<i class="icon-link"></i>' +
                                                        '</div>' +
                                                    '</div>' +
                                                    '<div class="attraction-caption">' +
                                                        '<div class="attraction-caption-title event-name">' + result.list_event_slider[i].event_type + '</div>' +
                                                        '<div class="attraction-distance">' + result.list_event_slider[i].created_date + '</div>' +
                                                    '</div>' +
                                                '</a>' +
                                            '</div>' +
                                        '</div>' +
                                    '<div class="col-md-6">' +
                                            '<div class="attraction-link">' +
                                                '<a href="/home/detail_event/' + result.list_event_slider[i + 1]._id + '" target="_blank">' +
                                                    '<div class="attraction-img">' +
                                                        '<img style="object-fit: cover;max-height:200px" class="img-responsive img-slider" src="' + result.list_event_slider[i + 1].thumbnail + '" alt="" />' +
                                                        '<div class="attraction-overlay">' +
                                                            '<i class="icon-link"></i>' +
                                                        '</div>' +
                                                    '</div>' +
                                                    '<div class="attraction-caption">' +
                                                        '<div class="attraction-caption-title event-name">' + result.list_event_slider[i + 1].event_type + '</div>' +
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
    $.toast({
        heading: message,
        text: '',
        position: 'top-right',
        loaderBg: '#ff6849',
        icon: 'error',
        hideAfter: 3500,
        stack: 6
    });
}

function show_alert(message) {
    $.toast({
        heading: message,
        text: '',
        position: 'top-right',
        loaderBg: '#ff6849',
        icon: 'success',
        hideAfter: 3500,
        stack: 6
    });
}

function send_mail_message() {
    // Load description of event
    var name = $('#txt_name').val();
    var mail = $('#txt_mail').val();
    var phone = $('#txt_phone').val();
    var address = $('#txt_address').val();
    var mail_content = $('#txt_mail_content').val();
    $('#btn_mail_message').blur();
    // Validate email
    var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    if ($.trim(name) == "") {
        show_error('Xin hãy nhập tên!');
        return;
    }
    if ($.trim(mail) == "") {
        show_error('Xin hãy nhập email!');
        return;
    }
    if (!filter.test(mail)) {
        show_error('Email không đúng!');
        return;
    }
    if ($.trim(phone) == "") {
        show_error('Xin hãy nhập số điện thoại!');
        return;
    }
    if ($.trim(address) == "") {
        show_error('Xin hãy nhập địa chỉ!');
        return;
    }
    if ($.trim(mail_content) == "") {
        show_error('Xin hãy nhập nội dung tin nhắn!');
        return;
    }
    $('#btn_mail_message').prop('disabled', true);
    $('#txt_name').val('');
    $('#txt_mail').val('');
    $('#txt_phone').val('');
    $('#txt_address').val('');
    $('#txt_mail_content').val('');
    var data = new FormData();
    data.append('name', name);
    data.append('mail', mail);
    data.append('phone', phone);
    data.append('address', address);
    data.append('mail_content', mail_content);
    $.ajax({
        url: "/send_mail_message", //the page containing python script
        type: "POST", //request type,
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function (result) {
            $('#btn_mail_message').prop('disabled', false);
            result = jQuery.parseJSON(result);
            if (result.result == 'success') {
                show_alert('Gửi tin nhắn thành công!');
            }
            else {
                //show_error('Gửi tin nhắn không thành công! Xin hãy thử lại!');
                show_error(result.message);
            }
        },
        error: function () {
            $('#btn_mail_message').prop('disabled', false);
            show_error('Gửi tin nhắn không thành công! Xin hãy thử lại!');
        },
    })
}


function send_mail_contact() {
    // Load description of event
    var name = $('#txt_contact_name').val();
    var mail = $('#txt_contact_mail').val();
    $('#btn_contact').blur();
    // Validate email
    var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    if (name == "") {
        show_error('Xin hãy nhập tên cá nhân/công ty!');
        return;
    }
    if (mail == "") {
        show_error('Xin hãy nhập email!');
        return;
    }
    if (!filter.test(mail)) {
        show_error('Email không đúng!');
        return;
    }
    $('#btn_contact').prop('disabled', true);
    $('#txt_contact_name').val('');
    $('#txt_contact_mail').val('');

    var data = new FormData();
    data.append('name', name);
    data.append('mail', mail);
    $.ajax({
        url: "/send_mail_contact", //the page containing python script
        type: "POST", //request type,
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function (result) {
            $('#btn_contact').prop('disabled', false);
            result = jQuery.parseJSON(result);
            if (result.result == 'success') {
                show_alert('Bạn đã gửi yêu cầu báo giá đến March Live Music!');
            }
            else {
                show_error('Gửi thông tin không thành công! Xin hãy thử lại!');
            }
        },
        error: function () {
            $('#btn_contact').prop('disabled', false);
            show_error('Gửi thông tin không thành công! Xin hãy thử lại!');
        },
    })
}


