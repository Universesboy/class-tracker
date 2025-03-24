# Deployment Checklist for GitHub Pages

## Configuration Tasks (Completed)

- ✅ Added `homepage` field in package.json: `"homepage": "https://xingchenfan.github.io/badminton-class-tracker"`
- ✅ Added `predeploy` and `deploy` scripts in package.json
- ✅ Switched to HashRouter for better GitHub Pages compatibility
- ✅ Created 404.html page with redirection script
- ✅ Updated index.html with GitHub Pages SPA routing script
- ✅ Fixed all TypeScript errors and warnings

## Remaining Tasks

1. **Create GitHub Repository**
   - Create a new repository named `badminton-class-tracker` on GitHub
   - Do not initialize with README, license, or .gitignore

2. **Connect Local Repository to GitHub**
   ```
   git remote add origin https://github.com/<your-username>/badminton-class-tracker.git
   git push -u origin main
   ```

3. **Deploy to GitHub Pages**
   ```
   npm run deploy
   ```
   This will:
   - Build the application
   - Push the build folder to the gh-pages branch

4. **Configure GitHub Pages**
   - Go to the repository settings on GitHub
   - Navigate to Pages section
   - Set the source branch to gh-pages
   - Save the changes

5. **Test the Deployment**
   - Check that your application is accessible at https://<your-username>.github.io/badminton-class-tracker
   - Verify:
     - Navigation works correctly
     - Authentication functions properly
     - All features are operational

## Troubleshooting

If you encounter routing issues:

1. **Check Browser Console**: Look for any errors in the browser console.

2. **Verify React Router Configuration**: Ensure HashRouter is being used correctly.

3. **Check GitHub Pages Configuration**: Make sure the gh-pages branch is set as the source in GitHub Pages settings.

4. **Test Locally**: Build the application (`npm run build`) and test it locally before deploying.

5. **Check Homepage Field**: Ensure the homepage field in package.json is correctly set to your GitHub Pages URL.

## Future Updates

To update the application in the future:

1. Make your changes locally
2. Test thoroughly
3. Commit the changes: `git add . && git commit -m "Description of changes"`
4. Push to GitHub: `git push origin main`
5. Redeploy to GitHub Pages: `npm run deploy` 