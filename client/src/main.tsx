console.log("main.tsx is loading");

// Force visible content without any CSS interference
const root = document.getElementById("root");
if (root) {
  console.log("Root element found");
  // Clear any existing CSS and force visibility
  document.head.innerHTML = '<meta charset="UTF-8"><title>Test</title>';
  document.body.style.cssText = 'margin: 0; padding: 20px; background: blue !important; color: white !important; font-family: Arial !important; font-size: 24px !important;';
  root.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; position: static !important; z-index: 9999 !important;';
  root.innerHTML = '<h1 style="color: white !important; background: red !important; padding: 20px !important; display: block !important;">FORCED VISIBILITY TEST - This should be visible on blue background</h1>';
} else {
  console.error("Root element not found");
}
