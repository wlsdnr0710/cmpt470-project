const input = document.querySelector('input');

input.addEventListener('input', updatelistgroup);

function updatelistgroup(e) {
    let query = e.target.value;
    for(var x = 0; x < users.length; x++) {
        var box = document.getElementById('a'+x);
        if(document.getElementById('username'+x).innerHTML.toLowerCase().includes(query)) {
            box.classList.add('show');
        }
        else{
            box.classList.remove('show');
        }
    }
}