var table;
var current_id = '';

$(document).ready(function () {
    function get_band_detail_data() {
        $.ajax({
            url: "/load_band_detail_data", //the page containing python script
            type: "POST", //request type,            
            cache: false,
            processData: false,
            contentType: false,
            success: function (result) {
                result = jQuery.parseJSON(result);
                if (result.result == 'success') {
                    var data = [];
                    for (var i = 0 ; i < result.list_band.length ; i++) {
                        var is_important = 'Không';
                        var is_approve = 'Chưa xét duyệt';
                        if (result.list_band[i].is_important == 'true') {
                            is_important = 'Có';
                        }
                        if (result.list_band[i].is_approve == 'true') {
                            is_approve = 'Đã xét duyệt';
                        }
                        var band_type = get_band_type(result.list_band[i].band_type)
                        data.push([
                            result.list_band[i]._id,
                            result.list_band[i].band_name,                            
                            band_type,
                            result.list_band[i].created_date,
                            is_important,
                            is_approve
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
                                '<button type="button" class="btn btn-info btn-outline btn-circle btn-lg m-r-5 delete-button"><i class="ti-trash"></i></button>'+
                                '<button type="button" class="btn btn-info btn-outline btn-circle btn-lg m-r-5 preview-button"><i class="ti-search"></i></button>';
        ;
        //var add_button_html = '<button id="add_event" class="fcbtn btn btn-info btn-outline btn-1c m-b-0" data-toggle="modal" data-target="#add_event">Thêm sự kiện</button>';
        var add_button_html = '<button id="add_event" class="fcbtn btn btn-info btn-outline btn-1c m-b-0 m-l-10">Thêm band detail</button>';
        table = $('#event_table').DataTable({
            data: dataSet,
            columns: [
                { id: "id" },
                { title: "Tên band" },
                { title: "Loại band nhạc" },                
                { title: "Ngày viết" },
                { title: "Hiển thị trang chủ" },
                { title: "Tình trạng" },
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
                },
                {
                    "targets": 1,
                    "width": 250,
                },
                {
                    "targets": 3,
                    "width": 110,
                },
                {
                    "targets": 4,
                    "width": 200,
                },
                {
                    "targets": 5,
                    "width": 150,
                },
                {
                    "targets": 6,
                    "width": 170,
                },
            ]
        });

        // Delete event
        $('#event_table tbody').on('click', '.delete-button', function () {
            var data = table.row($(this).parents('tr')).data();
            var band_id = data[0];
            current_id = band_id;
            swal({
                title: "Anh có chắc chắn muốn xóa bài viết band nhạc này?",
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
                data.append('band_id', current_id);
                $.ajax({
                    url: "/delete_band_detail", //the page containing python script
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
                            get_band_detail_data();
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
        $('#event_table tbody').on('click', '.edit-button', function () {
            var data = table.row($(this).parents('tr')).data();
            var band_id = data[0];
            window.location.href = '/admin/detail_band_page/' + band_id;
        }),

        $('#event_table_length').append(add_button_html);
        $('#add_event').on("click", function () {
            window.location.href = '/admin/add_band_detail';
        })
    }
    get_band_detail_data();

    $('#refesh_banner').on('click', function () {
        // Reload table
        table.destroy();
        get_band_detail_data();
    });

});

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

function get_band_type(band_type) {
    var band_type_name = ''
    switch(band_type) {
        case '1':
            band_type_name = 'DJ & EDM';
            break;
        case '2':
            band_type_name = 'POP';
            break;
        case '3':
            band_type_name = 'ROCK';
            break;
        case '4':
            band_type_name = 'COUNTRY';
            break;
        case '5':
            band_type_name = 'R&B';
            break;
        case '6':
            band_type_name = 'RAP';
            break;
        case '7':
            band_type_name = 'LATIN';
            break;
        case '8':
            band_type_name = 'KHÁC';
            break;
    }
    return band_type_name;

}