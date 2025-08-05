import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
import { App } from "@capacitor/app";
import { getConnection, closeConnection } from "./dbManager";
import { realpathSync } from "fs";

export let fileData = {
  data: null
};

document.addEventListener("DOMContentLoaded", () => {
  const editor = new Editor();
});

class Editor {
  constructor() {
    this.imagesDataArray = [];
    this.activeLayout = "None";
    this.pagesList = [];
    this.currentFile = "None";
    this.lastNoImages = 0;
    this.fileNameArray = [];
    this.currentFileState = "untitled";
    this.isAlertOpen = false;
    this.backHandlerRef = null;

    this.mainMethod();
    this.handleBack();
  }

  mainMethod() {
    this.uploadBtn = document.querySelector("#upload-btn");
    this.fileInput = document.querySelector("#file-input");
    this.menuBtn = document.querySelector("#menu-btn");
    this.menuCtrl = document.querySelector("#menu");
    this.imagesIonList = document.querySelector("#images-list");
    this.layoutLabel = document.querySelector("#layout-label");
    this.addImagesBtn = document.querySelector("#add-btn");
    this.pageContainer = document.querySelector(".page-container");
    this.saveBtn = document.querySelector("#save-btn");
    this.fileSaveAlert = document.querySelector(".file-save-alert");
    this.fileTitleLabel = document.querySelector("#title-label");
    this.unSaveAlert = document.querySelector(".unsave-alert");
    this.exportBtn = document.querySelector("#export-btn");

    this.layout1x1Btn = document.querySelector("#btn-1x1");
    this.layout2x2Btn = document.querySelector("#btn-2x2");
    this.layout2x3Btn = document.querySelector("#btn-2x3");
    this.layout3x3Btn = document.querySelector("#btn-3x3");

    this.icon1x1 = document.querySelector("#icon-1x1");
    this.icon2x2 = document.querySelector("#icon-2x2");
    this.icon2x3 = document.querySelector("#icon-2x3");
    this.icon3x3 = document.querySelector("#icon-3x3");

    try {
      this.layout1x1Btn.addEventListener(
        "click",
        this.setLayout.bind(this, "1x1")
      );
      this.layout2x2Btn.addEventListener(
        "click",
        this.setLayout.bind(this, "2x2")
      );
      this.layout2x3Btn.addEventListener(
        "click",
        this.setLayout.bind(this, "2x3")
      );
      this.layout3x3Btn.addEventListener(
        "click",
        this.setLayout.bind(this, "3x3")
      );
    } catch (error) {}

    this.uploadBtn.addEventListener("click", this.openFileDialog.bind(this));
    this.fileInput.addEventListener("change", this.getImages.bind(this));
    this.addImagesBtn.addEventListener(
      "click",
      this.addImagesToPage.bind(this)
    );
    this.saveBtn.addEventListener("click", this.saveFile.bind(this));
    this.exportBtn.addEventListener("click", this.exportFile.bind(this));

    this.menuBtn.addEventListener("click", () => {
      this.menuCtrl.open();
    });

    this.deleteListItem();

    let isOpen = sessionStorage.getItem("isOpen");
    if (isOpen === "True") {
      this.currentFileState = "saved";
      this.openFile();
    }
  }

  async readFromCache() {
    try {
      const result = await Filesystem.readFile({
        path: "tempdata.appimj",
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      return result.data;
    } catch (error) {
      console.error("Read failed:", error);
    }
  }

  deleteListItem() {
    this.listItemDelBtnArr = document.querySelectorAll(".delete-file-btn");
    this.listItemDelBtnArr.forEach((element) => {
      element.addEventListener("click", (event) => {
        const button = event.target;
        const ionItem = button.closest("ion-item");

        // Get the parent that contains the list of ion-items
        const itemList = ionItem.parentElement;

        // Convert all child ion-items to an array and find index
        const items = Array.from(itemList.querySelectorAll("ion-item"));
        const index = items.indexOf(ionItem);

        const isOpem = sessionStorage.getItem("isOpen");
        if (isOpem === "True") {
          const indexToRemove = index - this.fileNameArray.length;
          this.imagesDataArray.splice(indexToRemove, 1);
        } else if (isOpem === "False") {
          this.imagesDataArray.splice(index, 1);
        }

        console.log(this.imagesDataArray);

        if (ionItem) {
          ionItem.remove();
        }
      });
    });
  }

  openFileDialog(event) {
    event.preventDefault();
    this.fileInput.click();
  }

  getImages() {
    let fileName;
    for (let index = 0; index < this.fileInput.files.length; index++) {
      const element = this.fileInput.files[index];
      fileName = element["name"];
      this.imagesDataArray.push(element);

      const itemCode = `
      <ion-item>
      <ion-label class="file-name-label">${fileName}</ion-label>
      <ion-button class="delete-file-btn">Delete</ion-button>
      </ion-item>
      `;

      this.imagesIonList.innerHTML += itemCode;

      this.deleteListItem();
    }
  }

  setLayout(layout) {
    if (this.activeLayout == layout && layout == "1x1") {
      this.icon1x1.setAttribute("src", "./assets/icons/layout-1x1-icon@1x.png");
      this.icon1x1.setAttribute(
        "srcset",
        "./assets/icons/layout-1x1-icon@2x.png 2x, ./assets/icons/layout-1x1-icon@3x.png 3x"
      );
      this.activeLayout = "None";
    } else if (this.activeLayout == layout && layout == "2x2") {
      this.icon2x2.setAttribute("src", "./assets/icons/layout-2x2-icon@1x.png");
      this.icon2x2.setAttribute(
        "srcset",
        "./assets/icons/layout-2x2-icon@2x.png 2x, ./assets/icons/layout-2x2-icon@3x.png 3x"
      );
      this.activeLayout = "None";
    } else if (this.activeLayout == layout && layout == "2x3") {
      this.icon2x3.setAttribute("src", "./assets/icons/layout-2x3-icon@1x.png");
      this.icon2x3.setAttribute(
        "srcset",
        "./assets/icons/layout-2x3-icon@2x.png 2x, ./assets/icons/layout-2x3-icon@3x.png 3x"
      );
      this.activeLayout = "None";
    } else if (this.activeLayout == layout && layout == "3x3") {
      this.icon3x3.setAttribute("src", "./assets/icons/layout-3x3-icon@1x.png");
      this.icon3x3.setAttribute(
        "srcset",
        "./assets/icons/layout-3x3-icon@2x.png 2x, ./assets/icons/layout-3x3-icon@3x.png 3x"
      );
      this.activeLayout = "None";
    } else {
      this.setLayout_(layout);
      return;
    }
    const text = `Current layout: ${this.activeLayout}`;
    this.layoutLabel.innerHTML = text;
  }

  setLayout_(layout) {
    this.icon1x1.setAttribute("src", "/assets/icons/layout-1x1-icon@1x.png");
    this.icon1x1.setAttribute(
      "srcset",
      "/assets/icons/layout-1x1-icon@2x.png 2x, /assets/icons/layout-1x1-icon@3x.png 3x"
    );

    this.icon2x2.setAttribute("src", "/assets/icons/layout-2x2-icon@1x.png");
    this.icon2x2.setAttribute(
      "srcset",
      "/assets/icons/layout-2x2-icon@2x.png 2x, /assets/icons/layout-2x2-icon@3x.png 3x"
    );

    this.icon2x3.setAttribute("src", "/assets/icons/layout-2x3-icon@1x.png");
    this.icon2x3.setAttribute(
      "srcset",
      "/assets/icons/layout-2x3-icon@2x.png 2x, /assets/icons/layout-2x3-icon@3x.png 3x"
    );

    this.icon3x3.setAttribute("src", "/assets/icons/layout-3x3-icon@1x.png");
    this.icon3x3.setAttribute(
      "srcset",
      "/assets/icons/layout-3x3-icon@2x.png 2x, /assets/icons/layout-3x3-icon@3x.png 3x"
    );

    if (layout == "1x1") {
      this.icon1x1.setAttribute(
        "src",
        "/assets/icons/layout-1x1-active-icon@1x.png"
      );
      this.icon1x1.setAttribute(
        "srcset",
        "/assets/icons/layout-1x1-active-icon@2x.png 2x, /assets/icons/layout-1x1-active-icon@3x.png 3x"
      );
      this.activeLayout = layout;
    } else if (layout == "2x2") {
      this.icon2x2.setAttribute(
        "src",
        "/assets/icons/layout-2x2-active-icon@1x.png"
      );
      this.icon2x2.setAttribute(
        "srcset",
        "/assets/icons/layout-2x2-active-icon@2x.png 2x, /assets/icons/layout-2x2-active-icon@3x.png 3x"
      );
      this.activeLayout = layout;
    } else if (layout == "2x3") {
      this.icon2x3.setAttribute(
        "src",
        "/assets/icons/layout-2x3-active-icon@1x.png"
      );
      this.icon2x3.setAttribute(
        "srcset",
        "/assets/icons/layout-2x3-active-icon@2x.png 2x, /assets/icons/layout-2x3-active-icon@3x.png 3x"
      );
      this.activeLayout = layout;
    } else if (layout == "3x3") {
      this.icon3x3.setAttribute(
        "src",
        "/assets/icons/layout-3x3-active-icon@1x.png"
      );
      this.icon3x3.setAttribute(
        "srcset",
        "/assets/icons/layout-3x3-active-icon@2x.png 2x, /assets/icons/layout-3x3-active-icon@3x.png 3x"
      );
      this.activeLayout = layout;
    }

    const text = `Current layout: ${this.activeLayout}`;
    this.layoutLabel.innerHTML = text;
  }

  getRequiredPages(num = 0) {
    const isOpen = sessionStorage.getItem("isOpen");
    let noOfImages = this.imagesDataArray.length;

    if (isOpen === "True") {
      noOfImages = num;
    }
    let noOfImagesInAPage;

    switch (this.activeLayout) {
      case "1x1":
        noOfImagesInAPage = 1;
        break;
      case "2x2":
        noOfImagesInAPage = 4;
        break;
      case "2x3":
        noOfImagesInAPage = 6;
        break;
      case "3x3":
        noOfImagesInAPage = 9;
        break;
    }

    const pagesRequired = Math.floor(noOfImages / noOfImagesInAPage);
    return pagesRequired;
  }

  async addImagesToPage() {
    if (this.imagesDataArray.length === 0) {
      await this.showWarningToast("No images to add", "warning");
      return
    }

    if (this.activeLayout === "None") {
      await this.showWarningToast("No layout is selected", "warning");
      return;
    }

    if (this.currentFileState === "untitled") {
    } else if (
      this.currentFileState === "saved" ||
      this.currentFileState === "unsaved"
    ) {
      const isOpem = sessionStorage.getItem("isOpen");

      if (isOpem === "True") {
        let fileName = sessionStorage.getItem("openFileName");
        fileName = `*${fileName}`;
        this.fileTitleLabel.innerHTML = fileName;
      } else if (isOpem === "False") {
        let fileName = `*${this.currentFile}`;
        this.fileTitleLabel.innerHTML = fileName;
      }
      this.currentFileState = "unsaved";
    }

    const isOpen = sessionStorage.getItem("isOpen");
    if (isOpen === "True") {
      let data = await this.readFromCache();
      let decodeData = this.decodeData(data);
      let info = this.parseJSONdata(decodeData);

      const divCode = info[3];
      this.pageContainer.innerHTML = "";
      this.addImagesForOpen(divCode);
    }

    this.pageContainer.innerHTML = "";
    this.pagesList = [];

    let code = `<div class="a4-page"></div>`;
    this.pageContainer.innerHTML += code;

    let noOfPagesRequired = this.getRequiredPages();
    while (noOfPagesRequired >= 1) {
      let code = `<div class="a4-page"></div>`;
      this.pageContainer.innerHTML += code;

      console.log(noOfPagesRequired);
      noOfPagesRequired--;
    }

    let pages = document.getElementsByClassName("a4-page");
    let pageArr = Array.from(pages);
    pageArr.forEach((element) => {
      this.pagesList.push(element);
    });

    let layout;
    switch (this.activeLayout) {
      case "1x1":
        layout = "layout-1x1";
        break;
      case "2x2":
        layout = "layout-2x2";
        break;
      case "2x3":
        layout = "layout-2x3";
        break;
      case "3x3":
        layout = "layout-3x3";
        break;
    }

    this.pagesList.forEach((element) => {
      element.className = "";
      element.classList.add("a4-page");
      element.classList.add(layout);
    });

    console.log(this.imagesDataArray);
    this.addImages(0);
  }

  addImagesForOpen(code) {
    const num = this.fileNameArray.length - this.lastNoImages;

    this.pagesList = [];
    this.pageContainer.innerHTML += code;

    let noOfPagesRequired = this.getRequiredPages(num);
    while (noOfPagesRequired >= 1) {
      let code = `<div class="a4-page"></div>`;
      this.pageContainer.innerHTML += code;

      console.log(noOfPagesRequired);
      noOfPagesRequired--;
    }

    let pages = document.getElementsByClassName("a4-page");
    let pageArr = Array.from(pages);
    pageArr.forEach((element) => {
      this.pagesList.push(element);
    });

    let layout;
    switch (this.activeLayout) {
      case "1x1":
        layout = "layout-1x1";
        break;
      case "2x2":
        layout = "layout-2x2";
        break;
      case "2x3":
        layout = "layout-2x3";
        break;
      case "3x3":
        layout = "layout-3x3";
        break;
    }

    this.pagesList.forEach((element) => {
      element.className = "";
      element.classList.add("a4-page");
      element.classList.add(layout);
    });

    this.addImages(this.lastNoImages);
  }

  addImages(count_) {
    let count = count_;
    if (this.activeLayout === "1x1") {
      this.pagesList.forEach((element) => {
        for (let i = 0; i < 1; i++) {
          const reader = new FileReader();
          reader.onload = function () {
            let code = `<img class="user-name" src="${reader.result}"/>`;
            element.innerHTML += code;
          };
          reader.readAsDataURL(this.imagesDataArray[count]);
          count++;
        }
      });
    } else if (this.activeLayout === "2x2") {
      this.pagesList.forEach((element) => {
        for (let i = 0; i < 4; i++) {
          const reader = new FileReader();
          reader.onload = function () {
            let code = `<img class="user-name" src="${reader.result}"/>`;
            element.innerHTML += code;
          };
          reader.readAsDataURL(this.imagesDataArray[count]);
          count++;
        }
      });
    } else if (this.activeLayout === "2x3") {
      this.pagesList.forEach((element) => {
        for (let i = 0; i < 6; i++) {
          const reader = new FileReader();
          reader.onload = function () {
            let code = `<img class="user-name" src="${reader.result}"/>`;
            element.innerHTML += code;
          };
          reader.readAsDataURL(this.imagesDataArray[count]);
          count++;
        }
      });
    } else if (this.activeLayout === "3x3") {
      this.pagesList.forEach((element) => {
        for (let i = 0; i < 9; i++) {
          const reader = new FileReader();
          reader.onload = function () {
            let code = `<img class="user-name" src="${reader.result}"/>`;
            element.innerHTML += code;
          };
          reader.readAsDataURL(this.imagesDataArray[count]);
          count++;
        }
      });
    }
    this.lastNoImages = count;
  }

  saveFile() {
    if (this.currentFileState === "unsaved") {
      let fileName = String(this.fileTitleLabel.innerHTML).replace("*", "");
      fileName = fileName.replace(".appimj", "");
      this.saveFile_(fileName);
      sessionStorage.setItem("alreadySaved", "True");
      return;
    } else if (this.currentFileState === "saved") {
      return;
    }

    this.fileSaveAlert.header = "Save file";

    this.fileSaveAlert.buttons = [
      {
        text: "Cancel",
        cssClass: "alert-button-cancel",
      },
      {
        text: "Save",
        cssClass: "alert-button-confirm",
        handler: async (data) => {
          await this.showSaveLoading();
          setTimeout(async () => {
            await this.saveFile_(data.filename);
            await this.showToast("File saved successfully!");
            await this.hideSaveLoading();
          }, 50);
        },
      },
    ];

    this.fileSaveAlert.inputs = [
      {
        name: "filename",
        type: "text",
        placeholder: "Enter file name",
      },
    ];

    this.fileSaveAlert.present();
  }

  async saveFile_(filename) {
    this.currentFile = `${filename}.appimj`;

    this.fileTitleLabel.innerHTML = this.currentFile;

    const jsonData = this.giveJSONData();

    const encodedData = this.encodeData(jsonData);
    console.log(encodedData);

    if (Capacitor.getPlatform() === "android") {
      // Save using Capacitor Filesystem
      try {
        const res = await Filesystem.writeFile({
          path: this.currentFile,
          data: encodedData,
          directory: Directory.Documents,
        });
        console.log("Saved file on Android");

        const isSaved = sessionStorage.getItem("alreadySaved");
        if (isSaved !== "True") {
          const today = new Date();

          const day = String(today.getDate()).padStart(2, "0");
          const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
          const year = today.getFullYear();

          const formattedDate = `${day}.${month}.${year}`;
          const path = res.uri;

          await this.addDataToDB(this.currentFile, path, formattedDate);
        }
      } catch (err) {
        console.error("Failed to save on Android:", err);
      }
    }
    this.currentFileState = "saved";
  }

  giveJSONData() {
    const noOfPages = this.pagesList.length;
    let fileNameArray = [];

    if (this.fileNameArray.length !== 0) {
      this.fileNameArray.forEach((element) => {
        fileNameArray.push(element);
      });
    }
    this.imagesDataArray.forEach((element) => {
      fileNameArray.push(element.name);
    });

    const data = {
      pages: noOfPages,
      layout: this.activeLayout,
      fileNameArray: fileNameArray,
      lastNoImages: this.lastNoImages,
      divCode: this.pageContainer.innerHTML,
    };
    const stringData = JSON.stringify(data);
    console.log(stringData);
    return stringData;
  }

  encodeData(data) {
    const encoded = btoa(data);
    return encoded;
  }

  decodeData(data) {
    const decoded = atob(data);
    return decoded;
  }

  parseJSONdata(data) {
    let jsonData = JSON.parse(data);
    let fileNameArray = jsonData.fileNameArray;
    let layout = jsonData.layout;
    let code = jsonData.divCode;
    let lastNoImages = jsonData.lastNoImages;

    return [fileNameArray, lastNoImages, layout, code];
  }

  async openFile() {
    let data = await this.readFromCache();
    let decodeData = this.decodeData(data);
    let info = this.parseJSONdata(decodeData);

    let fileNameArray = info[0];
    let lastNoImages = info[1];
    let divCode = info[3];
    let layout = info[2];

    this.lastNoImages = lastNoImages;
    this.fileNameArray = fileNameArray;
    this.pageContainer.innerHTML = divCode;

    for (let index = 0; index < fileNameArray.length; index++) {
      const fileName = fileNameArray[index];

      const itemCode = `
      <ion-item>
      <ion-label class="file-name-label">${fileName}</ion-label>
      </ion-item>
      `;

      this.imagesIonList.innerHTML += itemCode;
    }

    const fileName = sessionStorage.getItem("openFileName");
    this.fileTitleLabel.innerHTML = fileName;

    this.setLayout(layout);
  }

  async addDataToDB(filename, filepath, date) {
    const sqlite = new SQLiteConnection(CapacitorSQLite);

    try {
      const connection = await getConnection();

      let query = `
      INSERT INTO FILES (filename, filepath, date) VALUES (?, ?, ?);
      `;
      await connection.run(query, [filename, filepath, date]);
    } catch (error) {
      console.log("ERROR LOGGING IN BIG SENTENCE", error);
    } finally {
      await closeConnection();
    }
  }

  handleBack() {
    if (!window.__backHandlerRegistered) {
      window.__backHandlerRegistered = true;

      App.addListener("backButton", async () => {
        if (this.isAlertOpen === true) {
          return;
        }
        this.isAlertOpen = true;

        // TODO: handle save file
        if (
          this.currentFileState === "unsaved" ||
          this.currentFileState === "untitled"
        ) {
          let unSaveAlert = document.createElement("ion-alert");

          unSaveAlert.header = "Unsaved";
          unSaveAlert.message = "File is not saved. Do you want to exit?";

          unSaveAlert.backdropDismiss = false;

          unSaveAlert.buttons = [
            {
              text: "No",
              cssClass: "alert-button-cancel",
              handler: () => {
                this.isAlertOpen = false;
              },
            },
            {
              text: "Yes",
              cssClass: "alert-button-confirm",
              handler: () => {
                this.isAlertOpen = false;
                window.history.back();
              },
            },
          ];

          document.body.appendChild(unSaveAlert);

          unSaveAlert.onDidDismiss().then(() => {
            console.log("[Alert Closed]");
            isAlertOpen = false;
          });

          unSaveAlert.present();
        } else {
          window.history.back();
        }
      });
    }
  }

  exportFile() {
    let exportAlert = document.createElement("ion-alert");

    exportAlert.header = "Export PDF";

    exportAlert.buttons = [
      {
        text: "Cancel",
        cssClass: "alert-button-cancel",
      },
      {
        text: "Export",
        cssClass: "alert-button-confirm",
        handler: (data) => {
          this.exportFile_(data.filename);
        },
      },
    ];

    exportAlert.inputs = [
      {
        name: "filename",
        type: "text",
        placeholder: "Enter file name",
      },
    ];

    document.body.appendChild(exportAlert);
    exportAlert.present();
  }

  async exportFile_(filename) {
    await this.showLoading(); // Start loader
    
    setTimeout(async () => {
      try {
        const element = document.querySelector(".page-container");
        const fileName = `${filename}.pdf`;

        const opt = {
          margin: [10, 0, 10, 10],
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        const worker = html2pdf().set(opt).from(element);
        await worker.toPdf();
        const blob = await worker.outputPdf("blob");

        const base64 = await this.blobToBase64(blob);

        await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Documents,
        });

        await this.showToast("PDF saved successfully!");
      } catch (err) {
        console.error(err);
        await this.showToast("Failed to generate PDF", "danger");
      } finally {
        await this.hideLoading(); // Stop loader
      }
    }, 50);
  }

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(blob);
    });
  }

  async showLoading() {
    const loader = document.getElementById("pdfLoader");
    await loader.present();
  }

  async hideLoading() {
    const loader = document.getElementById("pdfLoader");
    await loader.dismiss();
  }

  async showSaveLoading() {
    const loader = document.getElementById("fileSaveLoader");
    await loader.present();
  }

  async hideSaveLoading() {
    const loader = document.getElementById("fileSaveLoader");
    await loader.dismiss();
  }

  async showToast(message, color = "success") {
    const toast = document.getElementById("pdfToast");
    toast.message = message;
    toast.color = color;
    await toast.present();
  }

  async showWarningToast(message, color = "warning") {
    const toast = document.getElementById("warningToast");
    toast.message = message;
    toast.color = color;
    await toast.present();
  }
}
