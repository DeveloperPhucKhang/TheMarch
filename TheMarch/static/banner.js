$(document).ready(function () {
    // Basic
    
    //$('.dropify').dropify();
    function load_dropify() {
        $('.dropify').dropify({
            messages: {
                'default': 'Kéo hoặc click vào để chọn hình',
                'replace': 'Kéo hoặc click vào để đổi hình',
                'remove': 'Xóa',
                'error': 'Lỗi khi thêm hình'
            },
            tpl: {
                wrap: '<div class="dropify-wrapper"></div>',
                loader: '<div class="dropify-loader"></div>',
                message: '<div class="dropify-message"><span class="file-icon" /> <p>{{ default }}</p></div>',
                preview: '<div class="dropify-preview"><span class="dropify-render"></span><div class="dropify-infos"><div class="dropify-infos-inner"><p class="dropify-infos-message">{{ replace }}</p></div></div></div>',
                filename: '<p class="dropify-filename"><span class="file-icon"></span> <span class="dropify-filename-inner"></span></p>',
                clearButton: '<button type="button" class="dropify-clear">{{ remove }}</button>',
                errorLine: '<p class="dropify-error">{{ error }}</p>',
                errorsContainer: '<div class="dropify-errors-container"><ul></ul></div>'
            }
        });        
       
    }

    load_dropify();

    $('input[type="file"]').change(function () {
        upload_banner(this);
    });

    function initial_event_clear(element) {
        // Used events Clear
        var drEvent = element.dropify();
        drEvent.on('dropify.beforeClear', function (event, element) {
            if (clear_flg == false) {
                var result = confirm("Anh có muốn xóa banner  \"" + element.file.name + "\" không ?");
                if (result) {
                    //Logic to delete the item
                    var current_box = $(element)[0].input.parent().parent().parent();
                    var banner_number = current_box.attr('index');
                    current_input_file = $(element)[0].input;
                    var file_name = $(element)[0].input.parent().parent().find('label').text();
                    var data = new FormData();
                    data.append('file_name', file_name);
                    data.append('banner_number', banner_number);
                    $.ajax({
                        url: "/delete_banner", //the page containing python script
                        type: "DELETE", //request type,
                        data: data,
                        cache: false,
                        processData: false,
                        contentType: false,
                        success: function (result) {
                            result = jQuery.parseJSON(result);
                            if (result.result == 'success') {
                                clear_flg = true;
                                clear_banner(current_input_file);
                                current_input_file.attr('data-default-file', '');
                            }
                            else {
                                show_error(current_input_file);
                            }
                        },
                        error: function () {
                            show_error(current_input_file);
                        },
                    });
                }
                return false;
            }
            else {
                clear_flg = false;
                return true;
            }
        });
        drEvent.on('dropify.afterClear', function (event, element) {
            //alert('File deleted');
        });

        drEvent.on('dropify.errors', function (event, element) {
            console.log('Has Errors');
        });

    }

    initial_event_clear($('.dropify'));

    $('#add_banner').on('click', function () {
        //Check already add or not
        var last_box = $('#list_banner').find('.col-sm-3').last();
        if (last_box.find('label').html() == '') {
            swal("Đã thêm khung ảnh!");
            return;
        }
        //var index = $('#list_banner').find('.col-sm-3').length + 1;
        var html = '<div class="col-sm-3" index="' + 0 + '">' +
                        '<div class="white-box">' +
                            //'<button onclick="remove_banner(this)" style="float:right" type="button" class="btn btn-warning btn-circle"><i class="fa fa-times"></i> </button>' +
                            '<h3 class="box-title">Mẫu banner</h3>' +
                            '<label style="display:none" for="' + 0 + '_banner"></label>' +
                            '<input type="file" id="' + 0 + '_banner" class="dropify"' +
                                    'data-height="300"' +
                                    'data-default-file=""' +
                                    'data-max-file-size="2M"' +
                                    'data-show-remove="true"' +
                                    'data-allowed-file-extensions="jpg png" />' +
                    '</div>' +
                    '</div>';
        $('#list_banner').append(html);
        $('#list_banner').find('.col-sm-3').last().find('input[type="file"]').change(function () {
            upload_banner(this);
        });
        load_dropify();
        initial_event_clear($('#list_banner').find('.col-sm-3').last().find('input[type="file"]'));
        window.scrollTo(0, document.querySelector(".container-fluid").scrollHeight);
    });

    $('#refesh_banner').on('click', function () {
        $.ajax({
            url: "/refesh_banner", //the page containing python script
            type: "GET", //request type,            
            cache: false,
            processData: false,
            contentType: false,
            success: function (result) {
                result = jQuery.parseJSON(result);
                var list_banner = result.list_banner;
                $("#list_banner").html("");
                for (var i = 0; i < list_banner.length; i++){
                    var html = '<div class="col-sm-3" index="' + list_banner[i].index + '">' +
                            '<div class="white-box">' +
                                //'<button onclick="remove_banner(this)" style="float:right" type="button" class="btn btn-warning btn-circle"><i class="fa fa-times"></i> </button>' +
                                '<h3 class="box-title">Mẫu banner</h3>' +
                                '<label style="display:none" for="' + list_banner[i].index + '_banner">' + list_banner[i].name + '</label>' +
                                '<input type="file" id="' + list_banner[i].index + '_banner" class="dropify"' +
                                        'data-height="300"' +
                                        'data-default-file="' + list_banner[i].url + '"' +                                        
                                        'data-max-file-size="2M"' +
                                        'data-show-remove="true"' +
                                        'data-allowed-file-extensions="jpg png" />' +
                            '</div>' +
                            '</div>';
                    $("#list_banner").append(html);
                }
                load_dropify();
                initial_event_clear($('.dropify'));
                $('input[type="file"]').change(function () {
                    upload_banner(this);
                });
            },
            error: function () {
                show_error('');
            },
        });
    });
});
var current_input_file;
var clear_flg = false;

function delete_banner_server(file_name, element) {
    var curent_box = $(element).parent().parent();
    var banner_number = curent_box.attr('index')
    //Logic to delete the item    
    var data = new FormData();
    data.append('file_name', file_name);
    data.append('banner_number', banner_number);
    $.ajax({
        url: "/delete_banner", //the page containing python script
        type: "DELETE", //request type,
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function (result) {
            result = jQuery.parseJSON(result);
            if (result.result == 'success') {
                current_input_file.offsetParent().parent().parent().remove();
            }
            else {
                show_error(current_input_file);
            }
        },
        error: function () {
            show_error(current_input_file);
        },
    });
}

function remove_banner(element) {
    var current_input = $(element).parent().find('input[type="file"]');
    var result = false;
    var file_name = '';
    if (current_input.attr('data-default-file')) {
        file_name = current_input.attr('data-default-file').split('/').pop();
        result = confirm("Anh có muốn xóa banner  \"" + file_name + "\" không ?");
    }
    else if (current_input[0].files.length > 0) {
        file_name = current_input[0].files[0].name;
        result = confirm("Anh có muốn xóa banner  \"" + file_name + "\" không ?");
    }
    else {
        $(element).parent().parent().remove();
    }
    if (result) {
        current_input_file = current_input;
        delete_banner_server(file_name, element);
    }
}

function clear_banner(current_input) {
    var event = current_input.dropify();
    event = event.data('dropify')
    event.clearElement();
}

function show_error(current_input) {
    //var event = current_input.dropify();
    //event = event.data('dropify')
    //event.showError('minWidth');
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

function upload_banner(current_input) {    
    var old_file_name;
    if ($(current_input).attr('data-default-file')) {
        old_file_name = $(current_input).attr('data-default-file').split('/').pop();
    }
    else {
        old_file_name = ''
    }
    var banner_number = $(current_input).parent().parent().parent().attr('index');
    var data = new FormData();
    data.append('file', $(current_input)[0].files[0]);
    data.append('old_file_name', old_file_name);
    data.append('banner_number', banner_number);
    current_input_file = current_input;
    $.ajax({
        url: "/upload_banner", //the page containing python script
        type: "POST", //request type,
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function (result) {
            result = jQuery.parseJSON(result);
            if (result.result == 'success') {
                $(current_input_file).parent().parent().find('label').html(result.file_name);
            }
            else {
                show_error(current_input_file);
            }
        },
        error: function () {
            console.log("upload error")
        },
    });
}