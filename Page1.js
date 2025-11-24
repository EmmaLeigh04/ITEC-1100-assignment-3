const demoButton = document.querySelector(".demoButton");

demoButton.onclick = (event) => {
    event.preventDefault();
    window.location.replace(`/Page2-demo.html`);
}
