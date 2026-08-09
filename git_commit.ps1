$git = "C:\Users\patel\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"

Write-Host "Initializing Git Repository..."
& $git init
& $git config user.name "Patelshubham00123"
& $git config user.email "patelshubham00123@users.noreply.github.com"
& $git branch -M main

Write-Host "Adding Remote Origin..."
& $git remote remove origin 2>$null
& $git remote add origin https://github.com/Patelshubham00123/projects.git

Write-Host "Adding files and creating commit..."
& $git add .
& $git commit -m "Add Kesariya Farm A2 Vedic Ghee web application and purchasing workflow"

Write-Host "Git commit completed successfully!"
