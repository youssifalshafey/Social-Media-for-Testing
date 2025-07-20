const toggleCheckbox = document.getElementById('toggle');
const body = document.body;

if (localStorage.getItem('theme') === 'dark') {
    body.classList.remove('darkmode');
    toggleCheckbox.checked = true;
}else {
    body.classList.add("darkmode")
    toggleCheckbox.checked = false
}

toggleCheckbox.addEventListener('change', () => {
    if (toggleCheckbox.checked) {
        body.classList.remove('darkmode');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('darkmode');
        localStorage.setItem('theme', 'light');
    }
});
