# 📋 Manual Test Checklist for PLC Simulator v2.0

## 🚀 **Initial Setup Tests**

- [ ] **Application Launch**
  - [ ] Web version loads without errors
  - [ ] Electron desktop version launches properly (if testing desktop)
  - [ ] Check console for any errors (F12)
  - [ ] Verify default theme loads correctly

---

## 🎨 **Theme & Language Tests**

### **Theme Switching**
- [ ] Click theme button in menu bar
- [ ] Cycle through all available themes
- [ ] Verify colors change consistently across all components
- [ ] Check that theme persists after page reload

### **Language Switching** (🌐 button)
- [ ] Switch to English (EN)
- [ ] Switch to Portuguese (PT-BR)
- [ ] Switch to Japanese (JA)
- [ ] Switch to German (DE)
- [ ] Verify all UI text translates correctly
- [ ] Check that language persists after reload

---

## ⌨️ **Keyboard Shortcuts Tests**

Test each keyboard shortcut:

- [ ] **Ctrl+S** - Save program (should trigger save dialog/toast)
- [ ] **Ctrl+O** - Open program (should trigger file picker)
- [ ] **F5** - Toggle RUN/STOP execution
- [ ] **F6** - Switch to PROGRAM mode
- [ ] **F7** - STOP execution
- [ ] **F8** - RESET all variables
- [ ] **Ctrl+D** - Open Data Table
- [ ] **F1** - Open Help dialog
- [ ] **F2** - Open About dialog
- [ ] **Esc** - Close any open dialog

---

## 💾 **File Operations Tests**

### **Save Program**
- [ ] Write some IL code in editor
- [ ] Click Save button
- [ ] Verify file dialog opens (native on Electron, browser on Web)
- [ ] Save file with .txt extension
- [ ] Check toast notification appears: "Program saved successfully"
- [ ] Verify unsaved indicator disappears

### **Load Program**
- [ ] Click Load button
- [ ] Select a valid .txt program file
- [ ] Verify program loads into editor
- [ ] Check toast notification: "Program loaded"
- [ ] Confirm editor content matches file

### **Drag & Drop Load**
- [ ] Drag a .txt program file over application window
- [ ] Verify blue overlay appears: "Drop file to load program"
- [ ] Drop file
- [ ] Confirm program loads
- [ ] Check toast notification appears

---

## 🔔 **Toast Notifications Tests**

Verify toasts appear (no more window.alert!):

- [ ] **Success toasts** (green) - Save/Load operations
- [ ] **Error toasts** (red) - Invalid operations
- [ ] **Warning toasts** (orange) - Unsaved changes
- [ ] **Info toasts** (blue) - General information
- [ ] Toasts auto-dismiss after 5 seconds
- [ ] Toasts can be manually dismissed with X button
- [ ] Multiple toasts stack properly

---

## 💡 **Unsaved Changes Warning Tests**

### **Unsaved Indicator**
- [ ] Edit program text
- [ ] Verify orange pulsing dot appears in menu bar
- [ ] Verify tooltip says "Unsaved changes"
- [ ] Save program
- [ ] Confirm indicator disappears

### **Browser Close Warning**
- [ ] Edit program without saving
- [ ] Try to close browser tab
- [ ] Verify browser shows "leave site?" warning
- [ ] Cancel and save, then try again
- [ ] Confirm warning doesn't appear after saving

### **Load with Unsaved Changes**
- [ ] Edit program without saving
- [ ] Try to load another program
- [ ] Verify confirmation dialog appears
- [ ] Click Cancel - confirm load is cancelled
- [ ] Try again and click OK - confirm new program loads

### **Drag & Drop with Unsaved Changes**
- [ ] Edit program without saving
- [ ] Drag and drop a file
- [ ] Verify confirmation dialog appears
- [ ] Test both Cancel and OK options

---

## ⏳ **Loading Indicators Tests**

### **Save Operation**
- [ ] Click Save button
- [ ] Verify full-screen overlay appears with blur
- [ ] Check spinner animation is smooth
- [ ] Verify message: "Saving program..."
- [ ] Confirm overlay disappears after save completes

### **Load Operation**
- [ ] Click Load button
- [ ] Verify loading overlay appears
- [ ] Check message: "Loading program..."
- [ ] Confirm overlay dismisses after load

---

## 🎮 **Button Visual Feedback Tests**

Test each button type for proper hover/active/focus states:

### **Menu Bar Buttons** (top bar)
- [ ] Hover over each button - verify subtle lift and shadow
- [ ] Click button - verify press animation
- [ ] Tab through buttons with keyboard - verify focus ring appears
- [ ] All buttons respond consistently

### **Control Panel Buttons** (PROGRAM, RUN, STOP, RESET)
- [ ] Hover over each - verify lift effect (3px) and shadow
- [ ] Click - verify active state animation
- [ ] Tab focus - verify blue outline ring
- [ ] RESET button has orange background
- [ ] RUN button turns green when active with pulse animation
- [ ] Disabled buttons are grayed out (50% opacity, grayscale)

### **Scene IO Buttons** (Default Scene)
- [ ] Hover over input buttons - verify scale(1.15) and drop-shadow
- [ ] Click buttons - verify press feedback
- [ ] Tab focus - verify focus ring
- [ ] LED indicators change on click

### **Batch Scene Buttons** (valves, pump, mixer)
- [ ] Hover - verify lift and border color change
- [ ] Active state shows green background
- [ ] Emergency button shows red with fast pulse when active
- [ ] Tab focus shows outline ring

### **Dialog Buttons** (Help, About, Data Table)
- [ ] Close buttons (X) scale on hover
- [ ] Tab focus shows white outline ring
- [ ] Footer buttons have proper hover/active states

---

## ❓ **Help Dialog Tests**

- [ ] Open Help dialog (F1 or menu button)
- [ ] Verify dialog appears with smooth animation

### **Check Sections:**
- [ ] Overview section exists
- [ ] Keyboard Shortcuts table (10 shortcuts)
- [ ] Variables & Addressing reference (I, Q, T, C, M)
- [ ] Available Instructions list (12 instructions with examples)
- [ ] Tips & Tricks section (6 tips)

### **Interaction:**
- [ ] Scroll through content smoothly
- [ ] Hover over keyboard shortcut keys - styled as kbd elements
- [ ] Hover over tips - verify hover effect
- [ ] Click Close button or press Esc to close
- [ ] Verify smooth close animation

---

## ℹ️ **About Dialog Tests**

- [ ] Open About dialog (F2 or menu button)

### **Check Header:**
- [ ] Title shows "PLC Simulator"
- [ ] Version badge shows "v2.0.0"
- [ ] Platform badge shows "🖥️ Desktop" (Electron) or "🌐 Web"

### **Technology Stack Section:**
- [ ] React 18.3.1 card with icon
- [ ] TypeScript 5.6.3 card
- [ ] Vite 5.4.11 card
- [ ] Electron 39.1.2 card (only on desktop version)
- [ ] Hover over cards - verify hover effect

### **Features Section:**
- [ ] 6 feature cards displayed
- [ ] Each has icon, title, and description
- [ ] Hover effect works (slide transform)

### **UX Improvements Section:**
- [ ] 5 checkmarked items listed
- [ ] Includes: Toast notifications, Drag & drop, Unsaved changes warning, Loading indicators, Native file dialogs
- [ ] Hover effect on items

### **Credits Section**
- [ ] Credits section displays properly
- [ ] Close button works (X or Esc)

---

## 📊 **Data Table Dialog Tests**

- [ ] Open Data Table (Ctrl+D or menu button)

### **Verify Table Structure:**
- [ ] Headers: Variable, Type, Value, Preset, Accumulated, Flag
- [ ] Sticky header when scrolling
- [ ] Monospace font for values

### **Run Program and Check Values:**
- [ ] Load a test program with timers and counters
- [ ] Execute program
- [ ] Verify table shows active timers/counters
- [ ] Active values show in green
- [ ] Values update in real-time

### **Interaction:**
- [ ] Hover over table rows - verify highlight
- [ ] Scroll table content - sticky header stays
- [ ] Footer shows count: "X items"
- [ ] Close button works

---

## 🏭 **PLC Program Execution Tests**

### **Default Scene**

- [ ] Switch to Default Scene (if not already)
- [ ] Load Test Program (or write):
  ```
  LD I0.0
  OUT Q0.0
  ```

### **Test Execution:**
- [ ] Click PROGRAM mode
- [ ] Click RUN mode
- [ ] Status indicator shows "RUNNING" in green with pulse
- [ ] Click Input I0.0 button
- [ ] Verify Output Q0.0 LED turns on
- [ ] Release input, verify output turns off
- [ ] Click STOP - verify status changes to "STOPPED" in red
- [ ] Click RESET - verify all I/Os reset to 0

### **Timer Test**
- [ ] Write program with TON timer
- [ ] Execute and verify timer counts up
- [ ] Check Data Table shows timer accumulating
- [ ] Verify timer preset/done flag works

### **Counter Test**
- [ ] Write program with CTU counter
- [ ] Execute and verify counter increments
- [ ] Check Data Table shows counter value
- [ ] Test counter reset

---

## 🏭 **Batch Simulation Scene Tests**

- [ ] Switch to Batch Scene (button in menu bar)

### **Verify Layout:**
- [ ] Tank visualization appears on left
- [ ] Control panel on right
- [ ] Tank level display shows percentage

### **Load Batch Program**
- [ ] Load batch example program (if available)

### **Test Batch Operations:**
- [ ] Click valve/pump buttons
- [ ] Verify active buttons turn green
- [ ] Watch tank level change
- [ ] Check level sensors (S_MIN, S_MAX, S_HIGH) activate
- [ ] Verify indicators (valves, pump, mixer) light up
- [ ] Test emergency stop button (turns red with fast pulse)

### **Tank Liquid Animation:**
- [ ] Verify yellow liquid fills tank smoothly
- [ ] Level display updates in real-time
- [ ] Liquid height matches percentage

---

## 🖥️ **Electron Desktop Specific Tests**

*(Only if testing desktop version)*

### **Native File Dialogs:**
- [ ] Save uses native OS file picker
- [ ] Load uses native OS file picker
- [ ] Dialogs show proper file filters (.txt)

### **Window Management:**
- [ ] Window can be resized
- [ ] Application state persists across restarts
- [ ] Menu bar works in windowed mode

### **About Dialog:**
- [ ] Verify "Desktop" badge appears
- [ ] Electron version listed in technology stack

---

## 🌐 **Web Version Specific Tests**

*(Only if testing browser version)*

### **Browser File Picker:**
- [ ] Save triggers browser download
- [ ] Load uses `<input type="file">`

### **About Dialog:**
- [ ] Verify "Web" badge appears
- [ ] No Electron version listed

### **PWA Features** (if applicable):
- [ ] Can be installed as PWA
- [ ] Works offline (if service worker configured)

---

## 📱 **Responsive Design Tests**

*(Web version)*

### **Desktop View** (> 1024px)
- [ ] All components visible
- [ ] Layout is horizontal (scene | editor)

### **Tablet View** (768px - 1024px)
- [ ] Layout adjusts appropriately
- [ ] Buttons remain clickable
- [ ] Dialogs fit screen

### **Mobile View** (< 768px)
- [ ] Control buttons stack properly
- [ ] Scene grid reduces columns
- [ ] Dialogs are scrollable
- [ ] Menu bar scrolls horizontally

---

## 🎯 **Code Editor Tests**

### **Syntax Validation:**
- [ ] Write valid IL code - no errors
- [ ] Write invalid code - verify error messages appear
- [ ] Line numbers display correctly

### **Editing:**
- [ ] Can type and edit freely
- [ ] Copy/paste works
- [ ] Undo/redo functions (Ctrl+Z, Ctrl+Y)

### **Real-time Feedback:**
- [ ] Error messages update as you type
- [ ] Unsaved indicator appears on edit

---

## 🧪 **Edge Cases & Error Handling**

### **Invalid File Loading:**
- [ ] Try to load non-.txt file
- [ ] Try to load corrupted file
- [ ] Verify error toast appears
- [ ] Application doesn't crash

### **Empty Program:**
- [ ] Try to run with empty editor
- [ ] Verify appropriate feedback

### **Maximum Program Size:**
- [ ] Load/write very large program (100+ lines)
- [ ] Verify editor handles it
- [ ] Check performance

### **Rapid Clicking:**
- [ ] Rapidly click buttons
- [ ] Verify no duplicate actions
- [ ] No UI freezing

### **Network Issues** (Web version):
- [ ] Test with slow connection
- [ ] Test offline behavior

---

## ✅ **Final Verification**

### **Performance:**
- [ ] Application feels responsive
- [ ] Animations are smooth (60fps)
- [ ] No lag when switching scenes
- [ ] Memory usage is reasonable

### **Accessibility:**
- [ ] All buttons reachable via keyboard (Tab)
- [ ] Focus indicators clearly visible
- [ ] Screen reader compatibility (test if possible)
- [ ] Color contrast is sufficient

### **User Experience:**
- [ ] Workflows feel intuitive
- [ ] No more annoying alert() popups
- [ ] Toast notifications are helpful
- [ ] Loading states prevent confusion
- [ ] Unsaved changes protection prevents data loss

---

## 📝 **Notes Section**

Use this space to record any issues found:

```
Issue 1: [Description]
Steps to reproduce:
1. ...
2. ...

Issue 2: [Description]
...
```

---

## 🎉 **Testing Complete!**

Once you've gone through this entire checklist, you'll have thoroughly tested all the UX improvements and polishments added to the PLC Simulator!

### **Key Improvements Tested:**
- ✅ Toast notifications system
- ✅ Drag & drop file loading
- ✅ Unsaved changes tracking
- ✅ Loading indicators
- ✅ Button accessibility (focus states)
- ✅ Enhanced Help dialog
- ✅ Enhanced About dialog
- ✅ Keyboard shortcuts
- ✅ Native file dialogs (Electron)
- ✅ All button hover/active/focus states

---

**Happy Testing! 🚀**
