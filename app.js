// Global selection
const colorDivs = document.querySelectorAll(".color-bar");
const iconDivs = document.querySelectorAll(".color-option");
const generateBtn = document.querySelector(".generate");
const slider = document.querySelectorAll('input[type="range"]');
const currentHex = document.querySelectorAll(".color-bar h1");
const popup = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll(".filter");
const closeAdjustment = document.querySelectorAll(".close-adjustment");
const sliderContainer = document.querySelectorAll(".sliders");
const lockButton = document.querySelectorAll(".lock");
const refreshButton = document.querySelector(".refresh");
let initialColors;

// localstorage
let savedPalettes = [];

// event
lockButton.forEach((button, index) => {
  button.addEventListener("click", function () {
    lockTheColor(index);
  });
});
refreshButton.addEventListener("click", randomColors);
adjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustment(index);
  });
});
slider.forEach((slider) => {
  slider.addEventListener("input", hslControl);
});
closeAdjustment.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustment(index);
  });
});
colorDivs.forEach((div, index) => {
  div.addEventListener("input", () => {
    updateTextUI(index);
  });
});

currentHex.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];

  popupBox.classList.remove("active");
  popup.classList.remove("active");
});
// function
// COLOR GENETATE
function generateHex() {
  const hexColors = chroma.random();
  return hexColors;
}

// RANDOM COLOR
function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    // add to array
    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }

    const iconDiv = iconDivs[index];
    const colorOption = iconDiv.querySelectorAll(".color-option button");
    // ADD TO BACKGROUND
    div.style.background = randomColor;
    hexText.innerText = randomColor;

    checkTextContrast(randomColor, hexText);
    for (icon of colorOption) {
      checkTextContrast(randomColor, icon);
    }

    // Initial colorize
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const bright = sliders[1];
    const sat = sliders[2];

    colorizeSliders(color, hue, bright, sat);
  });
  resetInput();

  //check for button contrast
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, bright, sat) {
  // scale sat
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  // brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  sat.style.background = `linear-gradient(to right,${scaleSat(0)},${scaleSat(
    1
  )})`;
  bright.style.background = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)},${scaleBright(1)})`;

  // hue
  hue.style.background =
    "linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))";
}

function hslControl(e) {
  const index =
    e.target.getAttribute("data-hue") ||
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat");

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const bright = sliders[1];
  const sat = sliders[2];
  const bgColor = initialColors[index];
  let color = chroma(bgColor)
    .set("hsl.s", sat.value)
    .set("hsl.l", bright.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.background = color;
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const colorOption = iconDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h1");
  const icon = colorOption.querySelectorAll(".color-option button");

  textHex.innerText = color.hex();
  // check contrast
  checkTextContrast(color, textHex);
  for (icons of icon) {
    checkTextContrast(color, icons);
  }
}

// reset
function resetInput() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brigthColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brigthColor).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  // pop up animation
  const popupBox = popup.children[0];
  popupBox.classList.add("active");
  popup.classList.add("active");
}

function lockTheColor(index) {
  const lockIndex = colorDivs[index];
  lockIndex.classList.toggle("locked");
  lockButton[index].children[0].classList.toggle("fa-lock");
  lockButton[index].children[0].classList.toggle("fa-lock-open");
}

function openAdjustment(index) {
  sliderContainer[index].classList.toggle("active");
}

// Implement Save to palette and Localstorage stuff
const saevBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");

const libraryBtn = document.querySelector(".library");
const libraryContainer = document.querySelector(".library-container");
const libraryPopup = document.querySelector(".library-popup");
const closeLibrary = document.querySelector(".close-library");
saevBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibrary.addEventListener("click", openLibrary);
submitSave.addEventListener("click", savePalette);

function closePalette() {
  saveContainer.children[0].classList.toggle("active");
  saveContainer.classList.toggle("active");
}
function openPalette(e) {
  const popup = saveContainer.children[0];
  popup.classList.toggle("active");
  saveContainer.classList.toggle("active");
}
function savePalette() {
  saveContainer.children[0].classList.remove("active");
  saveContainer.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHex.forEach((hex) => {
    colors.push(hex.innerText);
  });
  // generate obj
  let paletteNr;
  const paletteObjj = JSON.parse(localStorage.getItem("palettes"));

  if (paletteObjj) {
    paletteNr = paletteObjj.length;
  } else {
    paletteNr = savedPalettes.length;
  }
  const paletteObj = { name, colors, nr: paletteNr };
  savedPalettes.push(paletteObj);
  saveInput.value = "";

  // saveLocalstorage
  saveToLocal(paletteObj);

  // Generate palettes to library
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.background = smallColor;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerText = "Select";

  // add event to the button
  paletteBtn.addEventListener("click", (e) => {
    openLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.background = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInput();
  });

  // appen to Library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryContainer.children[0].appendChild(palette);
}

function openLibrary() {
  libraryContainer.classList.toggle("active");
  libraryPopup.classList.toggle("active");
}

function saveToLocal(obj) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(obj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    savedPalettes = [...paletteObjects];
    paletteObjects.forEach((paletteObj) => {
      // Generate palettes to library
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      paletteObj.colors.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.background = smallColor;
        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(paletteObj.nr);
      paletteBtn.innerText = "Select";

      // add event to the button
      paletteBtn.addEventListener("click", (e) => {
        openLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.background = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInput();
      });

      // appen to Library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      libraryContainer.children[0].appendChild(palette);
    });
  }
}
randomColors();
getLocal();

