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
                var data = [];
                for (var i = 0 ; i < result.list_event.length ; i++) {
                    data.push([
                        result.list_event[i].event_type,
                        result.list_event[i].title,
                        result.list_event[i].created_by,
                        result.list_event[i].created_date,
                        result.list_event[i].is_important,
                    ]);
                }
                init_datatable(data);
            },
            error: function () {
                console.log("upload error")
            },
        });
    }

    function init_datatable(dataSet) {
        var manage_button_html = '<button type="button" class="btn btn-info btn-outline btn-circle btn-lg m-r-5 delete-button"><i class="ti-trash"></i></button>' +
                                 '<button type="button" class="btn btn-info btn-outline btn-circle btn-lg m-r-5 edit-button"><i class="ti-pencil-alt"></i></button>';
        //var add_button_html = '<button id="add_event" class="fcbtn btn btn-info btn-outline btn-1c m-b-0" data-toggle="modal" data-target="#add_event">Thêm sự kiện</button>';
        var add_button_html = '<button id="add_event" class="fcbtn btn btn-info btn-outline btn-1c m-b-0">Thêm sự kiện</button>';
        var table = $('#event_table').DataTable({
            data: dataSet,
            columns: [
                { title: "Loại sự kiện" },
                { title: "Tiêu đề" },
                { title: "Người viết" },
                { title: "Ngày viết" },
                { title: "Hiển thị trang chủ" },
                { title: "Quản lí" }
            ],
            "columnDefs": [
                {
                    "targets": -1,
                    "data": null,
                    "defaultContent": manage_button_html
                },
                {
                    "targets": 0,
                    "width": 130,
                },
                {
                    "targets": 2,
                    "width": 110,
                },
                {
                    "targets": 3,
                    "width": 100,
                },
                {
                    "targets": 4,
                    "width": 100,
                },
                {
                    "targets": 5,
                    "width": 200,
                },
            ]
        });
        $('#event_table tbody').on('click', '.delete-button', function () {
            var data = table.row($(this).parents('tr')).data();
            alert(data[0] + "'s salary is: " + data[4]);
        });

        $('#event_table_length').append(add_button_html);
        $('#add_event').on("click", function () {
            window.location.href = '/admin/add_event';
        })
    }
    get_event_data();

    
});