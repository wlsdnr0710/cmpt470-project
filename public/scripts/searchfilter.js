const input = document.getElementById('searchtext');

input.addEventListener('change', updatelistgroup);

function updatelistgroup(e) {
    let query = e.target.value;
    for(var x = 0; x < users.length; x++) {
        var box = document.getElementById('a'+x);
        if(document.getElementById('username'+x).innerHTML.includes(query)) {
            box.collapse('show');
        }
        else{
            box.collapse('hide');
        }
    }
}