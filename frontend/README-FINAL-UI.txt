FARM AI FINAL UI

This final package:
- Uses image assets instead of emoji-style UI icons.
- Removes the old floating AI Assistant widget that was showing broken characters.
- Uses the approved no-person farm dashboard layout.
- Adds a farm image to the sign-in page.
- Keeps Crop Detection, AI Chatbot, History, Recommendations, Profile, Home and Logout.
- Creates a backup before modifying App.jsx/App.css and existing UI files.

Run from:
C:\Users\SAI LAKSHMI\Desktop\Farm-AI-Advisory\frontend

Command:
powershell -ExecutionPolicy Bypass -File .\apply-final-ui.ps1

Then:
npm run build
npm run dev -- --host 127.0.0.1 --force
