document.addEventListener("DOMContentLoaded", () => {
  initCreateFormHandler();
  initUpdateFormHandlers();
});

async function initCreateFormHandler() {
  const createForm = document.getElementById("createForm");
  createForm.onsubmit = async () => {
    fetch("/database/create", {
      method: "POST",
      body: new FormData(createForm),
    });
  };
}

async function initUpdateFormHandlers() {
  let updateForms = [];
  for (var i = 0; i < gameLists.length; i++) {
    updateForms.push(document.getElementById("updateForm"+i));
  }
  
  for (var i = 0; i < updateForms.length; i++) {
    let url = gameListUpdateUrls[i];
    let updateForm = updateForms[i];
    updateForm.onsubmit = async function() {
      fetch(url, {
        method: "POST",
        body: new FormData(updateForm),
      });
    };
  }
}

// TODO: Add handlers for adding/removing games, deleting game list
