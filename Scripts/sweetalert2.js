function showSuccess(title, text) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });
}
function showError(title, text) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'error',
        confirmButtonText: 'Aceptar'
    });
}
function showSuccessToast(message) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });

    Toast.fire({
        icon: 'success',
        title: message
    });
}
function showErrorToast(message) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });
    Toast.fire({
        icon: 'error',
        title: message
    });
}
function showinfo(message) {
    Swal.fire({
        title: 'Información',
        text: message,
        icon: 'info',
        confirmButtonText: 'Aceptar'
    });
}
export { showSuccess, showError, showSuccessToast, showErrorToast, showinfo };