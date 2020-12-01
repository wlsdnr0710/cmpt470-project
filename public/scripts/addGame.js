document.addEventListener("DOMContentLoaded", () => {
  initAddGameFormHandler();
});

async function initAddGameFormHandler() {
  const addGameForm = document.getElementById("addGameForm");
  let url = addGameUrl;
  addGameForm.onsubmit = async () => {
    console.log(url);
    fetch(url, {
      method: "POST",
      body: new FormData(addGameForm),
    });
  };
}
