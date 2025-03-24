# GitHub Setup and Deployment Guide

## Setting Up GitHub Repository

1. **Create a GitHub Repository**
   - Go to [GitHub](https://github.com) and log in
   - Click the "+" icon in the top right corner and select "New repository"
   - Name your repository: `badminton-class-tracker`
   - Make it Public
   - Do not initialize with README, .gitignore, or license (since we already have these files)
   - Click "Create repository"

2. **Connect your local repository to GitHub**
   Run these commands in your terminal:
   ```
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/badminton-class-tracker.git
   git push -u origin main
   ```
   Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

## Deploying to GitHub Pages

After connecting to GitHub, you can deploy the application:

1. **Deploy your application**
   ```
   npm run deploy
   ```
   This will build your application and deploy it to the gh-pages branch.

2. **Set up GitHub Pages in repository settings**
   - Go to your repository on GitHub
   - Click on "Settings"
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "Deploy from a branch"
   - Select "gh-pages" branch and "/ (root)" folder
   - Click "Save"

3. **Wait for deployment**
   - It may take a few minutes for your site to be published
   - Once published, you'll see a message with the URL (typically https://YOUR_GITHUB_USERNAME.github.io/badminton-class-tracker/)

4. **Test your application**
   - Visit the URL to ensure everything works correctly
   - Test navigation, features, and make sure routing works properly

## Troubleshooting

If you encounter issues with routing:
1. Make sure your React Router is configured with the correct basename
2. Verify that `package.json` has the correct homepage URL
3. Check that the 404.html file is properly configured
4. Review GitHub Pages settings to ensure the correct branch is being deployed

## Updating Your Application

To update your application after making changes:
1. Make and test your changes locally
2. Commit your changes: `git add . && git commit -m "Description of changes"`
3. Push to GitHub: `git push origin main`
4. Redeploy: `npm run deploy` 