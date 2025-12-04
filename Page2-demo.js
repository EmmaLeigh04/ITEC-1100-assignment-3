const gameButton = document.querySelector(".gameButton");

gameButton.onclick = (event) => {
    event.preventDefault();
    window.location.replace(`game.html`);
}
