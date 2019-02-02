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

async function resizeImage(file, max_width, max_height) {
    if (file == undefined)
        return file;
    let fileContents = await compressFile(file, max_width, max_height);
    // convert resized canvas to file object
    var blobBin = atob(fileContents.split(',')[1]);
    var array = [];
    for (var i = 0; i < blobBin.length; i++) {
        array.push(blobBin.charCodeAt(i));
    }
    const fileName = file.name;
    var file_converted = new File([new Uint8Array(array)], fileName, {
        type: 'image/jpeg',
        lastModified: Date.now()
    });
    return file_converted;
}

function compressFile(file, max_width, max_height) {
    let dataurl;
    const reader = new FileReader();
    const fileName = file.name;
    return new Promise((resolve, reject) => {
        reader.onload = (e) => {
            var img = document.createElement("img");
            img.onload = () => {
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                var MAX_WIDTH = max_width;
                var MAX_HEIGHT = max_height;
                var width = img.width;
                var height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                dataurl = canvas.toDataURL(file.type);
                resolve(dataurl);
            }
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
