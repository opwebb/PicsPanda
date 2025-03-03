
# Deployment Instructions

This is a static website that can be deployed to any static hosting service like Cloudflare Pages, GitHub Pages, Netlify, or Vercel.

## Files to Deploy

Upload all the files in this `static` directory to your hosting service.

## For Replit Deployment

1. In Replit, open the "Deployments" tab.
2. Choose "Static" as the deployment type.
3. Configure the build and public directory:
   - Build command: (leave empty, these are already built static files)
   - Public directory: `static`
4. Click "Deploy" to start the deployment process.
5. Once deployed, Replit will provide you with a URL to access your site.

## Folder Structure

```
static/
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   ├── convert.js
│   ├── compress.js
│   └── pdf-compress.js
├── index.html
├── convert.html
├── compress.html
└── pdf-compress.html
```
