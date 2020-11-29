document.addEventListener("DOMContentLoaded", () => {
  initCreateFormHandler();
});

async function initCreateFormHandler() {
  const createForm = document.getElementById("createForm");
  createForm.onsubmit = async () => {
    let response = await fetch("/testDb/create", {
      method: "POST",
      body: new FormData(createForm),
    });
    let result = await response.json();
    console.log(result);
  };
}
