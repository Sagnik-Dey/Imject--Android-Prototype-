import { StatusBar } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { FilePicker } from "@capawesome/capacitor-file-picker";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { App } from "@capacitor/app";
import { getConnection, closeConnection } from "./dbManager";
import "core-js/features/global-this";

if (typeof globalThis === "undefined") {
  Object.defineProperty(Object.prototype, "__magic__", {
    get: function () {
      return this;
    },
    configurable: true,
  });
  __magic__.globalThis = __magic__;
  delete Object.prototype.__magic__;
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new MainApp();
});

App.addListener("backButton", () => {
  App.exitApp();
});

class MainApp {
  constructor() {
    this.addFilesCard();
    this.hideStatusBar();
    this.initWeb();
  }

  initWeb() {
    this.newBtn = document.querySelector("#new-btn");
    this.openBtn = document.querySelector("#open-btn");
    this.cardSection = document.querySelector(".card-section");
    this.cards = document.querySelectorAll(".file-card");
    this.cardDelBtns = document.querySelectorAll(".delete-btn-card");
    console.log(this.cards);

    this.newBtn.addEventListener("click", this.openEditor.bind(this));
    this.openBtn.addEventListener("click", this.openFileInEditor.bind(this));
    this.cards.forEach((element) => {
      element.addEventListener("click", (event) => {
        console.log("Card clicked:", element);
        this.cardClicked(event, element);
      });
    });
  }

  openEditor(event) {
    event.preventDefault();
    console.log("Working..");
    sessionStorage.setItem("isOpen", "False");
    window.location.href = "editor.html";
  }

  hideStatusBar() {
    if (Capacitor.getPlatform() !== "web") {
      try {
        StatusBar.hide();
      } catch (e) {
        console.error("Failed to hide status bar", e);
      }
    }
  }

  async openFileInEditor() {
    console.log("here");
    const result = await FilePicker.pickFiles({
      readData: true,
    });

    await this.showLoading();
    setTimeout(async () => {
      if (result.files.length > 0) {
        const file = result.files[0];
        console.log("Picked file:", file);
        sessionStorage.setItem("openFileName", file.name);

        sessionStorage.setItem("isOpen", "True");
        const writeToCache = async () => {
          try {
            await Filesystem.writeFile({
              path: "tempdata.appimj",
              data: file.data,
              directory: Directory.Cache,
              encoding: Encoding.UTF8,
            });

            console.log("✅ File written to cache");
          } catch (error) {
            console.error("Write failed:", error);
          }
        };
        writeToCache();
        window.location.href = "editor.html";
        await this.hideLoading();
      }
    }, 50);
  }

  async performDBOperation() {
    const sqlite = new SQLiteConnection(CapacitorSQLite);

    try {
      const connection = await getConnection();

      let query = `
      SELECT filename, date FROM FILES;
      `;
      const res = await connection.query(query);

      return res;
    } catch (error) {
      console.log(error);
    } finally {
      await closeConnection();
    }
  }

  async addFilesCard() {
    const data = await this.performDBOperation();
    console.log("data", data);
    let code;

    data.values.forEach((element) => {
      code = `
            <ion-card class="file-card">
                <div class="card-header-data">
                  <ion-card-header>
                      <ion-card-title class="card-title"
                      >${element.filename}</ion-card-title
                    >
                    <ion-card-subtitle class="card-subtitle"
                    >Created: ${element.date}</ion-card-subtitle
                    >
                  </ion-card-header>
                </div>
              
                <ion-button fill="clear" class="delete-btn-card">
                  <img src="assets/icons/delete-icon@1x.png" 
                  srcset="./assets/icons/delete-icon@2x.png 2x, ./assets/icons/delete-icon@3x.png 3x"
                  alt="delete" />
                </ion-button>
            </ion-card>
       `;
      this.cardSection.innerHTML += code;
    });
    this.cards = document.querySelectorAll(".file-card");
    this.cards.forEach((element) => {
      element.addEventListener("click", (event) => {
        console.log("Card clicked:", element);
        this.cardClicked(event, element);
      });
    });
    this.cardDelBtns = document.querySelectorAll(".delete-btn-card");
    this.cardDelBtns.forEach((element) => {
      element.addEventListener("click", (event) => {
        console.log("Btn clicked:", element);
        this.deleteCard(event, element);
      });
    });
  }

  async cardClicked(event, element) {
    event.preventDefault();
    await this.showLoading();

    setTimeout(async () => {
      const fileName = element.querySelector(".card-title").textContent;
      sessionStorage.setItem("openFileName", fileName);
      sessionStorage.setItem("isOpen", "True");

      let content;

      try {
        const result = await Filesystem.readFile({
          path: fileName,
          directory: Directory.Documents,
        });

        content = result.data;
      } catch (err) {
        await this.showToast(`File not found: ${fileName}`, "danger");
        return;
      } finally {
        const writeToCache = async () => {
          try {
            await Filesystem.writeFile({
              path: "tempdata.appimj",
              data: content,
              directory: Directory.Cache,
              encoding: Encoding.UTF8,
            });

            window.location.href = "editor.html";
            console.log(content, "content");
          } catch (error) {
            console.error("Write failed:", error);
            console.log(content, "content");
            return
          }
        };
        await writeToCache();
        await this.hideLoading();
      }
    }, 50);
  }

  deleteCard(event, element) {
    event.stopPropagation();
    event.preventDefault();
    let confirmAlert = document.createElement("ion-alert");

    confirmAlert.header = "Remove";

    confirmAlert.buttons = [
      {
        text: "Cancel",
        cssClass: "alert-button-cancel",
      },
      {
        text: "Remove",
        cssClass: "alert-button-confirm",
        handler: async () => {
            try {
              const fileName = element.parentElement.querySelector(".card-title").textContent;
              const connection = await getConnection();

              let query = `
              DELETE FROM FILES WHERE filename = ?;
              `;
              const res = await connection.run(query, [fileName]);

              this.cardSection.innerHTML = "";
              await this.addFilesCard();
            } catch (error) {
              console.log(error);
            } finally {
              await closeConnection();
            }
        },
      },
    ];

    confirmAlert.message = "Are you sure you want to remove this file card?";

    document.body.appendChild(confirmAlert);
    confirmAlert.present(); 
  }

  async showLoading() {
    const loader = document.getElementById("editor-loading");
    await loader.present();
  }

  async hideLoading() {
    const loader = document.getElementById("editor-loading");
    await loader.dismiss();
  }

  async showToast(message, color = "danger") {
    const toast = document.getElementById("file-not-found-toast");
    toast.message = message;
    toast.color = color;
    await toast.present();
  }
}
