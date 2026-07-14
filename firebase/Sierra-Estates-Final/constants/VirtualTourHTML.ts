export const VIRTUAL_TOUR_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
<title>Virtual 3D Tour</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
<style>
  * { margin:0; padding:0; }
  html, body { width:100%; height:100%; overflow:hidden; background:#000; font-family: sans-serif; }
  #panorama { width:100%; height:100%; }
  
  /* Custom close button for mobile */
  #close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 100;
    background: rgba(0,0,0,0.5);
    color: white;
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    cursor: pointer;
  }
</style>
</head>
<body>
<div id="panorama"></div>
<script>
  // High-res equirectangular interior image placeholder for Villa
  const VILLA_PANORAMA_URL = "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80";
  // Note: For a true 360 experience in production, this should be a 2:1 equirectangular image.
  // We use Pannellum to render it as a 360 navigable space.

  pannellum.viewer('panorama', {
    "type": "equirectangular",
    "panorama": "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/2294472375_24a3b8ef46_o.jpg",
    "autoLoad": true,
    "autoRotate": -2,
    "compass": true,
    "showControls": false
  });
</script>
</body>
</html>`;
