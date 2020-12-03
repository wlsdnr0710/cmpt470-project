document.addEventListener("DOMContentLoaded", () => {
  initCreateFormHandler();
  initUpdateFormHandlers();
});

async function initCreateFormHandler() {
  const createForm = document.getElementById("createForm");
  if (!createForm) return;
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
    if (!document.getElementById("updateForm" + i)) return;
    updateForms.push(document.getElementById("updateForm" + i));
  }

  for (var i = 0; i < updateForms.length; i++) {
    let url = gameListUpdateUrls[i];
    let updateForm = updateForms[i];
    updateForm.onsubmit = async function () {
      fetch(url, {
        method: "POST",
        body: new FormData(updateForm),
      });
    };
  }
}
