
$(document).ready(function () {

    $('form').bind('submit', function (e) {
        e.preventDefault();
        login();
    })

})

function login() {
    $('.help-block').hide();
    // Load description of event
    var username = $('#txt_username').val();
    var password = $('#txt_password').val();
    var remember = $('#ckb_remember').is(":checked");
    if (username == "") {
        show_warning('Xin hãy nhập email!');
        return;
    }
    if (password == "") {
        show_warning('Xin hãy nhập số điện thoại!');
        return;
    }
    var data = new FormData();
    data.append('username', username);
    data.append('password', password);
    data.append('remember', remember);
    $.ajax({
        url: "/login", //the page containing python script
        type: "POST", //request type,
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function (result) {
            result = jQuery.parseJSON(result);
            if (result.result == 'success') {
                if (result.role == 'admin') {
                    window.location.href = '/admin/banner';
                } else {
                    window.location.href = '/admin/band_detail';
                }
            }
            else {
                if (result.type == 'server') {
                    $('#error_server').show();
                    $('#error_server').html(result.message)
                }
                else if (result.type == 'username') {
                    $('#error_username').show();
                    $('#error_username').html(result.message)
                }
                else {
                    $('#error_password').show();
                    $('#error_password').html(result.message)
                }
            }
        },
        error: function () {
            show_warning('');
        },
    })
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

function show_warning(message) {
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

