var table;
var current_id = '';

$(document).ready(function () {
    function get_event_data() {
        $.ajax({
            url: "/load_event_data", //the page containing python script
            type: "POST", //request type,            
            cache: false,
            processData: false,
            contentType: false,
            success: function (result) {
                result = jQuery.parseJSON(result);
                if (result.result == 'success') {
                    var data = [];
                    for (var i = 0 ; i < result.list_event.length ; i++) {
                        var is_important = 'Không';
                        var is_approve = 'Chưa xét duyệt';
                        if (result.list_event[i].is_important == 'true') {
                            is_important = 'Có';
                        }
                        if (result.list_event[i].is_approve == 'true') {
                            is_approve = 'Đã xét duyệt';
                        }
                        data.push([
                            result.list_event[i]._id,
                            result.list_event[i].event_type,
                            result.list_event[i].title,
                            result.list_event[i].created_by,
                            result.list_event[i].created_date,
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
        var add_button_html = '<button id="add_event" class="fcbtn btn btn-info btn-outline btn-1c m-b-0">Thêm sự kiện</button>';
        table = $('#event_table').DataTable({
            data: dataSet,
            columns: [
                { id: "id" },
                { title: "Tên sự kiện" },
                { title: "Tiêu đề" },
                { title: "Người viết" },
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
                    "width": 150,
                },
                {
                    "targets": 3,
                    "width": 110,
                },
                {
                    "targets": 4,
                    "width": 100,
                },
                {
                    "targets": 5,
                    "width": 100,
                },
                {
                    "targets": 6,
                    "visible": false,
                    "searchable": false
                },
                {
                    "targets": 7,
                    "width": 170,
                },
            ]
        });

        // Delete event
        $('#event_table tbody').on('click', '.delete-button', function () {
            var data = table.row($(this).parents('tr')).data();
            var event_id = data[0];
            current_id = event_id;
            swal({
                title: "Anh có chắc chắn muốn xóa sự kiện này?",
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
                data.append('event_id', current_id);
                $.ajax({
                    url: "/delete_event", //the page containing python script
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
                            get_event_data();
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
            var event_id = data[0];
            window.location.href = '/admin/detail_event/' + event_id;
        }),

        //edit event
        $('#event_table tbody').on('click', '.preview-button', function () {
            var data = table.row($(this).parents('tr')).data();
            var event_id = data[0];
            url = '/admin/event_detail_preview/' + event_id;
            //window.location.href = '/admin/event_detail_preview/' + event_id;
            window.open(url, '_blank');
            window.focus();
        })

        $('#event_table_length').append(add_button_html);
        $('#add_event').on("click", function () {
            window.location.href = '/admin/add_event';
        })
    }
    get_event_data();

    $('#refesh_banner').on('click', function () {
        // Reload table
        table.destroy();
        get_event_data();
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
