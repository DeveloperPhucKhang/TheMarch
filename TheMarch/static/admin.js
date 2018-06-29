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
