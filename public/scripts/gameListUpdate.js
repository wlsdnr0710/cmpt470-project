document.addEventListener("DOMContentLoaded", () => {
  initCreateFormHandler();
});

async function initCreateFormHandler() {
  const createForm = document.getElementById("createForm");
  createForm.onsubmit = async () => {
    fetch("/testDb/create", {
      method: "POST",
      body: new FormData(createForm),
    });
  };
}

// TODO: Add handlers for adding/removing games, deleting game list
