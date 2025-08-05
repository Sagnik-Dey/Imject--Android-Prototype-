# Imject (Android Prototype)

<img width="128" height="128" alt="logo-resized" src="https://github.com/user-attachments/assets/a929f0c9-574d-4641-943a-61aea24b171e" />

📱 **Imject** brings its powerful image layout and PDF export functionality to Android. Upload images, arrange them into layouts, and export them — all from your phone.

> ⚠️ This is a **prototype version** of the Android build. Expect limited features and potential bugs.

---

### 📸 What It Does

- Upload images directly from your device  
- Arrange them on a canvas (a4 page) using customizable layouts  
- Save your layout progress using `.appimj` files  
- Export the final arrangement to a clean **PDF file**  
- Store and load projects from your device

<img width="317" height="600" alt="1754415893315-portrait" src="https://github.com/user-attachments/assets/54308cd5-e441-4e4b-a019-d05caf70991e" /> <img width="317" height="600" alt="1754416225756-portrait" src="https://github.com/user-attachments/assets/df5d3afb-fb8e-4a90-86d1-98c1706d61df" />

---

### 🔧 How to build & run 

1. Clone the repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the frontend using Vite:
   ```bash
   npm run build
   ```
4. Add the Android platform (If not already added):
   ```bash
   npx cap add android
   ```

5. Copy the build to Capacitor:
   ```bash
   npx cap copy android
   npx cap sync android
   ```

6. Run on your Android device:
   ```bash
   npx cap run android
   ```

7. If you want to open the project in Android Studio:
   ```bash
   npx cap open android
   ```

> Ensure you have Android Studio and an emulator/device connected for deployment.

---

### 🧠 Tech Stack

- **Vanilla JavaScript**
- **Ionic Framework + Capacitor**
- **Vite** for frontend builds
- **Android SDK** for platform deployment

---

### 📝 Known Limitations

- May have layout scaling issues on some custom OS skins
- Splash screen behavior may vary based on device manufacturer

---

### 📁 Project Structure

```
📁 dist/                   ← Final Vite build output  
📁 www/                    ← Source code (HTML/CSS/JS)  
📁 public/                 ← Static assets (images, icons)
📄 capacitor.config.json  
📄 vite.config.js  
```

---

### 📄 License

This prototype is released under the [MIT License](LICENSE).  
Some dependencies may be under different licenses. See [`THIRD_PARTY_LICENSES.md`](THIRD_PARTY_LICENSES.md).
