var table;
var current_id = '';
function get_band_category_data() {
    $.ajax({
        url: "/load_band_category_data", //the page containing python script
        type: "POST", //request type,            
        cache: false,
        processData: false,
        contentType: false,
        success: function (result) {
            result = jQuery.parseJSON(result);
            if (result.result == 'success') {
                var data = [];
                for (var i = 0 ; i < result.list_band_category.length ; i++) {
                    data.push([
                        result.list_band_category[i]._id,
                        result.list_band_category[i].name,
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
    var add_button_html = '<button id="add_band_category" data-toggle="modal" data-target="#modal-add" class="fcbtn btn btn-info btn-outline btn-1c m-b-0 m-l-10">Thêm danh mục</button>';
    table = $('#band_category_table').DataTable({
        data: dataSet,
        columns: [
            { id: "id" },
            { title: "Danh mục" },
            { title: "Quản lí" }
        ],
        "order": [[1, "desc"]],
        "columnDefs": [
            {
                "targets": -1,
                "data": null,
                "defaultContent": manage_button_html
                //"width": 200,
            },
            {
                "targets": 0,
                "visible": false,
                "searchable": false
            },
             {
                 "targets": 1,
                 "width": 800,
             },
        ]
    });

    // Delete event
    $('#band_category_table tbody').on('click', '.delete-button', function () {
        var data = table.row($(this).parents('tr')).data();
        var category_id = data[0];
        current_id = category_id;
        swal({
            title: "Anh có chắc chắn muốn xóa danh mục này không?",
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
            data.append('category_id', current_id);
            $.ajax({
                url: "/delete_band_category", //the page containing python script
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
                        get_band_category_data();
                    }
                    else {
                        if (result.message == 'exist') {
                            show_error('Danh mục ban nhạc này hiện đang có ban nhạc!');
                        } else {
                            show_error('Có lỗi xảy ra trong khi xóa sự kiện!');
                        }
                    }
                },
                error: function () {
                    show_error('Có lỗi xảy ra trong khi xóa sự kiện!');
                },
            });
        });
    });

    //edit event
    $('#band_category_table tbody').on('click', '.edit-button', function () {
        var data = table.row($(this).parents('tr')).data();
        var category_id = data[0];
        var name = data[1];
        $('#category_id').attr('value', category_id);
        $('#txt_categoryname').val(name);
        $('#modal-update').modal('show');
    }),

    $('#band_category_table_length').append(add_button_html);

}

$(document).ready(function () {

    get_band_category_data();

    $('#refesh_band').on('click', function () {
        // Reload table
        table.destroy();
        get_band_category_data();
        $(this).blur();
    });

    $('#add_form').bind('submit', function (e) {
        e.preventDefault();
        add_band_category();
    });

    $('#update_form').bind('submit', function (e) {
        e.preventDefault();
        update_band_category();
    });

});

function add_band_category() {
    var name = $('#txtCategoryName').val();
    if ($.trim(name) == '') {
        return;
    }
    var data = new FormData();
    data.append('name', name);
    $.ajax({
        url: "/admin/add_band_category", //the page containing python script
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
                get_band_category_data();
            }
            else {
                show_warning('Tên danh mục đã tồn tại!')
            }
        },
        error: function () {
            show_error('');
        },
    });

}

function update_band_category() {
    var category_id = $('#category_id').attr('value');
    var name = $('#txt_categoryname').val();
    if ($.trim(name) == '') {
        return;
    }
    var data = new FormData();
    data.append('category_id', category_id);
    data.append('name', name);
    $.ajax({
        url: "/admin/update_band_category", //the page containing python script
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
                get_band_category_data();
            }
            else {
                show_warning('Tên danh mục đã tồn tại!')
            }
        },
        error: function () {
            show_error('Xảy ra lỗi trong quá trình thực hiện!');
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
