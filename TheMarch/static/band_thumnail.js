$(document).ready(function () {
    // Basic
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
        upload_band_thumbnail(this);
    });

    function initial_event_clear(element) {
        // Used events Clear
        var drEvent = element.dropify();
        drEvent.on('dropify.beforeClear', function (event, element) {
            if (clear_flg == false) {
                var result = confirm("Anh có muốn xóa hình band  \"" + element.file.name + "\" không ?");
                if (result) {
                    //Logic to delete the item
                    var current_box = $(element)[0].input.parent().parent().parent();
                    var band_index = current_box.attr('index');
                    current_input_file = $(element)[0].input;
                    var data = new FormData();
                    data.append('file_name', $(element)[0].input.attr('thumbnail_name'));
                    data.append('band_index', band_index);
                    data.append('band_id', $(element)[0].input.attr('band_id'));
                    $.ajax({
                        url: "/delete_band_thumbnail", //the page containing python script
                        type: "DELETE", //request type,
                        data: data,
                        cache: false,
                        processData: false,
                        contentType: false,
                        success: function (result) {
                            result = jQuery.parseJSON(result);
                            if (result.result == 'success') {
                                show_alert('');
                                clear_flg = true;
                                clear_band(current_input_file);
                                $(current_input_file).attr('thumbnail_name', 'default.jpg');
                            }
                            else {
                                show_error('');
                            }
                        },
                        error: function () {
                            show_error('');
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
            
        });

        drEvent.on('dropify.errors', function (event, element) {
            console.log('Has Errors');
        });

    }

    initial_event_clear($('.dropify'));

    $('#refesh_band').on('click', function () {
        $.ajax({
            url: "/refesh_band_thumbnail", //the page containing python script
            type: "GET", //request type,            
            cache: false,
            processData: false,
            contentType: false,
            success: function (result) {
                show_alert('Load thành công!');
                result = jQuery.parseJSON(result);
                var list_band = result.list_band;
                $("#thumbnail_video").html("");
                var html = '<div class="col-sm-4" index="11">'+
                                '<div class="white-box">'+
                                    '<form class="form-horizontal" data-toggle="validator">'+
                                        '<button onclick="save_band_info(\'' + list_band[0]._id + '\',\'' + list_band[0].index + '\')" style="float:right;width: auto;" class="btn btn-block btn-default">Lưu</button>' +
                                        '<h3 class="box-title">Hình thumbnail của video</h3>' +
                                        '<label>Kích thước: 1138x518</label>' +
                                        '<div class="input-group m-b-10">'+
                                            '<span class="input-group-addon" id="basic-addon1">Url video</span>'+
                                            '<input id="txt_url_'+list_band[0].index+'" type="text" value="'+list_band[0].url+'" class="form-control" placeholder="Url" aria-describedby="basic-addon1" required>'+
                                        '</div>'+
                                    '</form>'+
                                    '<input thumbnail_name="' + list_band[0].thumbnail_name + '" band_id="' + list_band[0]._id + '" type="file" id="' + list_band[0].index + '_band" class="dropify"' +
                                           'data-height="300"'+
                                           'data-default-file="'+list_band[0].thumbnail+'"'+
                                           'data-max-file-size="10M"'+
                                           'data-show-remove="true"'+
                                           'data-allowed-file-extensions="jpg png" />'+
                                '</div>'+
                            '</div>';
                $("#thumbnail_video").html(html);
                $("#list_band").html("");
                for (var i = 1; i < list_band.length; i++) {
                    var html = '<div class="col-sm-4" index="' + list_band[i].index + '">' +
                                '<div class="white-box">' +
                                    '<form class="form-horizontal" data-toggle="validator">' +
                                        '<button onclick="save_band_info(\'' + list_band[i]._id + '\',\'' + list_band[i].index + '\')" style="float:right;width: auto;" class="btn btn-block btn-default">Lưu</button>' +
                                        '<h3 class="box-title">Band thứ ' + list_band[i].index + '</h3>' +
                                        '<div class="input-group m-b-10">'+
                                            '<span class="input-group-addon" id="basic-addon1">Tên band</span>'+
                                            '<input id="txt_name_' + list_band[i].index + '" type="text" value="' + list_band[i].name + '" class="form-control" placeholder="Tên" aria-describedby="basic-addon1" required>' +
                                        '</div>'+
                                        '<div class="input-group m-b-10">' +
                                            '<span class="input-group-addon" id="basic-addon1">Url band</span>' +
                                            '<input id="txt_url_' + list_band[i].index + '" type="text" value="' + list_band[i].url + '" class="form-control" placeholder="Url" aria-describedby="basic-addon1" required>' +
                                        '</div>' +
                                    '</form>' +
                                    '<input thumbnail_name="' + list_band[i].thumbnail_name + '" band_id="' + list_band[i]._id + '" type="file" id="' + list_band[i].index + '_band" class="dropify"' +
                                           'data-height="300"' +
                                           'data-default-file="' + list_band[i].thumbnail + '"' +
                                           'data-max-file-size="10M"' +
                                           'data-show-remove="true"' +
                                           'data-allowed-file-extensions="jpg png" />' +
                                '</div>' +
                            '</div>';
                    $("#list_band").append(html);
                }
                load_dropify();
                initial_event_clear($('.dropify'));
                $('input[type="file"]').change(function () {
                    upload_band_thumbnail(this);
                });
                $('form').bind('submit', function (e) {
                    e.preventDefault();
                })
            },
            error: function () {
                show_error('');
            },
        });
    });

    $('form').bind('submit', function (e) {
        e.preventDefault();
    })
});


var current_input_file;
var clear_flg = false;

function clear_band(current_input) {
    var event = current_input.dropify();
    event = event.data('dropify')
    event.clearElement();
}

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

function upload_band_thumbnail(current_input) { 
    var old_file_name = $(current_input).attr('thumbnail_name');
    var band_index = $(current_input).parent().parent().parent().attr('index');
    var data = new FormData();
    data.append('band_id', $(current_input).attr('band_id'));
    data.append('file', $(current_input)[0].files[0]);
    data.append('old_file_name', old_file_name);
    data.append('band_index', band_index);
    current_input_file = current_input;
    $.ajax({
        url: "/admin/upload_band_thumbnail", //the page containing python script
        type: "POST", //request type,
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function (result) {
            result = jQuery.parseJSON(result);
            if (result.result == 'success') {
                show_alert('Lưu thành công!');
                $(current_input_file).attr('thumbnail_name', result.file_name);
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

////////////
function save_band_info(id, index) {
    var name;
    if (index == '0') {
        name = 'default.jpg';
    } else {
        name = $('#txt_name_' + index).val();
    }    
    var url = $('#txt_url_' + index).val();
    if ($.trim(name) == '' || $.trim(url) == '') {
        return;
    }
    var data = new FormData();
    data.append('band_id', id);
    data.append('name', name);
    data.append('url', url);
    $.ajax({
        url: "/admin/save_band_thumbnail_info", //the page containing python script
        type: "POST", //request type,
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function (result) {
            result = jQuery.parseJSON(result);
            if (result.result == 'success') {
                show_alert('Lưu thành công')
            }
            else {
                show_error('');
            }
        },
        error: function () {
            console.log("upload error")
        },
    });

}
