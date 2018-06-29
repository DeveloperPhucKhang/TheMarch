var table;
var current_id = '';
function get_band_user_data() {
    $.ajax({
        url: "/load_band_user_data", //the page containing python script
        type: "POST", //request type,            
        cache: false,
        processData: false,
        contentType: false,
        success: function (result) {
            result = jQuery.parseJSON(result);
            if (result.result == 'success') {               
                var data = [];
                for (var i = 0 ; i < result.list_band.length ; i++) {
                    data.push([
                        result.list_band[i]._id,
                        result.list_band[i].name,
                        result.list_band[i].user,
                        result.list_band[i].role,
                    ]);
                }
                init_datatable(data);
            }
            else {
                show_error('Có lỗi xảy ra trong quá trình lấy thông tin!');
            }
        },
        error: function () {
            show_error('Có lỗi xảy ra trong quá trình lấy thông tin!');
        },
    });
}

function init_datatable(dataSet) {
    var manage_button_html = '<button type="button" class="btn btn-info btn-outline btn-circle btn-lg m-r-5 edit-button"><i class="ti-pencil-alt"></i></button>' +
                            '<button type="button" class="btn btn-info btn-outline btn-circle btn-lg m-r-5 delete-button"><i class="ti-trash"></i></button>';
    var add_button_html = '<button id="add_band_user" data-toggle="modal" data-target="#modal-add" class="fcbtn btn btn-info btn-outline btn-1c m-b-0 m-l-10">Thêm band user</button>';
    table = $('#band_user_table').DataTable({
        data: dataSet,
        columns: [
            { id: "id" },
            { title: "Tên band" },
            { title: "Tên đăng nhập" },
            { title: "Loại user" },
            { title: "Quản lí" }
        ],
        "order": [[1, "desc"]],
        "columnDefs": [
            {
                "targets": -1,
                "data": null,
                "defaultContent": manage_button_html
            },
            {
                "targets": 0,
                "visible": false,
                "searchable": false
            }
            //{
            //    "targets": 1,
            //    "width": 200,
            //},
            //{
            //    "targets": 2,
            //    "width": 400,
            //},
            //{
            //    "targets": 3,
            //    "width": 100,
            //}
        ]
    });

    // Delete event
    $('#band_user_table tbody').on('click', '.delete-button', function () {
        var data = table.row($(this).parents('tr')).data();
        var event_id = data[0];
        current_id = event_id;
        swal({
            title: "Anh có chắc chắn muốn xóa user band này không?",
            text: "Xóa rồi sẽ không thể phục hồi được!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            closeOnConfirm: false,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
            showLoaderOnConfirm: true
        }, function () {
            var data = new FormData();
            data.append('user_id', current_id);
            $.ajax({
                url: "/delete_band_user", //the page containing python script
                type: "DELETE", //request type,
                data: data,
                cache: false,
                processData: false,
                contentType: false,
                success: function (result) {
                    result = jQuery.parseJSON(result);
                    if (result.result == 'success') {
                        swal({
                            title: "Xóa thành công",
                            type: "success",
                            timer: 2000,
                            showConfirmButton: true,
                            closeOnConfirm: true
                        });
                        // Reload table
                        table.destroy();
                        get_band_user_data();
                    }
                    else {
                        show_error('Có lỗi xảy ra trong khi xóa sự kiện!');
                    }
                },
                error: function () {
                    show_error('Có lỗi xảy ra trong khi xóa sự kiện!');
                },
            });
        });
    });

    //edit event
    $('#band_user_table tbody').on('click', '.edit-button', function () {
        var data = table.row($(this).parents('tr')).data();
        var user_id = data[0];
        var name = data[1];
        var user = data[2];
        $('#band_id').attr('value', user_id);
        $('#txt_bandname').val(name);
        $('#txt_user').html(user);
        $('#modal-update').modal('show');
    }),

    $('#band_user_table_length').append(add_button_html);

}

$(document).ready(function () {
    
    get_band_user_data();

    $('#refesh_band').on('click', function () {
        // Reload table
        table.destroy();
        get_band_user_data();
    });

    $('#add_form').bind('submit', function (e) {
        e.preventDefault();
        add_band_user();
    });

    $('#update_form').bind('submit', function (e) {
        e.preventDefault();
        update_band_user();
    });

});

function add_band_user() {
    var name = $('#txtbandname').val();
    var user = $('#txtuser').val();
    var password = $('#txtpassword').val();
    if ($.trim(name) == '' || $.trim(user) == '' || $.trim(password) == '') {
        return;
    }
    var data = new FormData();
    data.append('name', name);
    data.append('user', user);
    data.append('password', password);
    $.ajax({
        url: "/admin/add_band_user", //the page containing python script
        type: "POST", //request type,
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function (result) {
            result = jQuery.parseJSON(result);
            if (result.result == 'success') {
                show_alert('Tạo thành công');
                $('#modal-add').modal('hide');
                // Reload table
                table.destroy();
                get_band_user_data();
            }
            else {
                show_warning('Tên đăng nhập đã tồn tại!')
            }
        },
        error: function () {
            show_error('');
        },
    });

}

function update_band_user() {
    var user_id = $('#band_id').attr('value');
    var name = $('#txt_bandname').val();
    //var user = $('#txt_user').val();
    var password = $('#txt_password').val();
    if ($.trim(name) == '') {
        return;
    }
    var data = new FormData();
    data.append('user_id', user_id);
    data.append('name', name);
    //data.append('user', user);
    data.append('password', $.trim(password));
    $.ajax({
        url: "/admin/update_band_user", //the page containing python script
        type: "POST", //request type,
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function (result) {
            result = jQuery.parseJSON(result);
            if (result.result == 'success') {
                show_alert('Lưu thành công');
                $('#modal-update').modal('hide');
                // Reload table
                table.destroy();
                get_band_user_data();
            }
            else {
                show_warning('Tên đăng nhập đã tồn tại!')
            }
        },
        error: function () {
            show_error('');
        },
    });

}

function show_error(message) {
    swal({
        title: "Lỗi!",
        text: message,
        type: "warning",        
        showCancelButton: false,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "OK",
        closeOnConfirm: true
    });
}
