import * as THREE from 'three';

// Fix 3D asset paths for GitHub Pages sub-directory hosting
THREE.DefaultLoadingManager.setURLModifier((url) => {
  const baseUrl = import.meta.env.BASE_URL;
  if (url.startsWith('/') && !url.startsWith(baseUrl)) {
    return baseUrl + url.slice(1);
  }
  return url;
});
